/** © 2016 Pillsy, Inc.
 *  @author  Chuks Onwuneme
 *  @version 1.0
 *  @package Pillsy backend API drug helper module 
 */
'use strict';

exports.populateDrugData = function(drug, user, callback, interval){
	var logger       = require('./../../configs/logger');
	var lodash       = require('lodash');
	var DrugEvent    = require('./../../models/DrugEvent');
	var PillsyEvent  = require('./../../models/PillsyEvent');
	var DrugReminder = require('./../../models/DrugReminder');

	logger.info('populateDrugdata');

	getDrugReminders();

	function getDrugReminders(){
		logger.info('populateDrugdata - getDrugReminders');

		var query = {
			owner: 	 user.id,
			drug: 	 drug.id,
			deleted: false
		};

		DrugReminder.find(query, function(err, drugReminders){
			if (err){
				logger.info('populateDrugdata - getDrugReminders - err: '+err.message);

				return returnPopulatedData([], []);
			}
			else{
				if (drugReminders.length > 0){
					logger.info('populateDrugdata - getDrugReminders - successfully retrieved reminders, now get drugEvents');

					var modifiedDrugReminders = [];

					drugReminders.forEach(function(drugReminder){
						logger.info('populateDrugdata - drugReminder before conversion to object: '+JSON.stringify(drugReminder));

						drugReminder = drugReminder.toObject();
						delete drugReminder['deleted'];

						logger.info('populateDrugdata - drugReminder: '+JSON.stringify(drugReminder));
						modifiedDrugReminders.push(drugReminder);
					});

					drugReminders = modifiedDrugReminders;

					return getDrugEvents(drugReminders);
				}
				else{
					logger.info('populateDrugdata - getDrugReminders - no drugReminders');

					return returnPopulatedData([], []);
				}
			}
		});
	}

	function getDrugEvents(drugReminders){
		logger.info('populateDrugdata - getDrugEvents');

		var startTime   = new Date(interval.startTime).toISOString();
		var endTime     = new Date(interval.endTime).toISOString();
		var reminderIds = lodash.map(drugReminders, 'id');

		logger.info('populateDrugdata - getDrugEvents - reminderIds: '+JSON.stringify(reminderIds));

		//get events tagged to this reminder for the past 30 days
		var query = {
			drug: 		drug.id,
			eventType:  {
				$in: ['DRUG','CONNECTION']   //also need connection event
			},
			eventValue:   {
				$in: ['TAKE','UNTAKE','SKIP','SNOOZE']
			},
			eventTime: { 
				$gte: startTime,
				$lte: endTime
			},
			drugReminder: {
				$in: reminderIds
			}
		};

		DrugEvent.find(query)
		.sort('-eventTime')
		.limit(200)
		.exec(function(err, drugEvents){
			if (err){
				logger.info('populateDrugdata - getDrugEvents - err: '+err.message);

				return getPillsyEvents(drugReminders, []);
			}
			else{
				logger.info('populateDrugdata - getDrugEvents - successfully retrieved drugEvents');

				return getPillsyEvents(drugReminders, drugEvents);
			}
		});
	}

	function getPillsyEvents(drugReminders, drugEvents){
		logger.info('populateDrugdata - getPillsyEvents - there are '+drugEvents.length+' drugEvents, not get pillsyEvents and add...');

		var pillsyDevice = drug.pillsyDevice;

		if (pillsyDevice){
			logger.info('populateDrugdata - getPillsyEvents - this drug has a pillsyDevice...');

			var deviceId = pillsyDevice.deviceId;

			var startTime = new Date(interval.startTime).toISOString();
			var endTime   = new Date(interval.endTime).toISOString();

			//get events tagged to this reminder for the past 30 days
			var query = {
				deviceId: deviceId,
				eventType: {
					$in: ['CONNECTION','DFU']
				},   
				eventTime: { 
					$gte: startTime,
					$lte: endTime
				}
			};

			logger.info('populateDrugdata - getPillsyEvents - query: '+JSON.stringify(query));

			PillsyEvent.find(query)
			.sort('-eventTime')
			.limit(200)
			.exec(function(err, pillsyEvents){
				if (err){
					logger.info('populateDrugdata - getPillsyEvents - err: '+err.message);

					return returnPopulatedData(drugReminders, drugEvents);
				}
				else{
					logger.info('populateDrugdata - getPillsyEvents - successfully retrieved '+pillsyEvents.length+' pillsyEvents');

					if (pillsyEvents.length > 0){
						drugEvents = drugEvents.concat(pillsyEvents);
					}
					
					return returnPopulatedData(drugReminders, drugEvents);
				}
			});
		}
		else{
			logger.info('populateDrugdata - getPillsyEvents - this drug has no pillsyDevice...');

			return returnPopulatedData(drugReminders, drugEvents);
		}
	}

	function returnPopulatedData(drugReminders, drugEvents){
		logger.info('populateDrugdata - returnPopulatedData');

		drug = drug.toObject();
		drug.drugReminders = drugReminders;
		drug.drugEvents    = drugEvents;

		logger.info('populateDrugdata - success. Returning drug: '+JSON.stringify(drug));
		return callback(null, drug);
	}
}

exports.processDoseAdherence = function(takeEvents, req){
	var logger = require('./../../configs/logger');
	var async  = require('async');

	logger.info('processDoseAdherence');

	var drugReminderData = [];

	takeEvents.forEach(function(takeEvent){
		var obj = {
			eventId:      takeEvent.id,
			owner:        takeEvent.owner,
			drug:         takeEvent.drug,
			drugReminder: takeEvent.drugReminder,
			reminderTime: takeEvent.reminderTime,
			eventValue:   takeEvent.eventValue
		};

		drugReminderData.push(obj);
	});

	if (drugReminderData.length > 0) { //array of drugs/days_affected
        logger.info('processDoseAdherence - got drugReminderData: '+JSON.stringify(drugReminderData));
        logger.info('processDoseAdherence - async: ' + async);
        logger.info('processDoseAdherence - start the async...');

        async.map(drugReminderData, updateDoseAdherence, function(err, results){
            if (err) {
                logger.error('processDoseAdherence - err processing adherence...: ' + err.message);
            } 
            else {
                logger.info('processDoseAdherence - successfully completed updating adherence...');
            }
        });
    } 
    else {
        logger.info('processDoseAdherence - did not get object from queue, return...');

        return completeQueueCallback(null);
    }

    //compute the adherence for this drug for all affected days
    function updateDoseAdherence(obj, iCallback) {
        logger.info('processDoseAdherence - updateDoseAdherence - obj: ' + JSON.stringify(obj));

        var owner        = obj.owner;
        var drug         = obj.drug;
        var drugReminder = obj.drugReminder;
        var reminderTime = obj.reminderTime;
        var eventValue   = obj.eventValue;
        var eventId      = obj.eventId;

        logger.info('processDoseAdherence - updateDoseAdherence - drugReminder: ' + drugReminder);
        logger.info('processDoseAdherence - updateDoseAdherence - owner: ' + owner);
        logger.info('processDoseAdherence - updateDoseAdherence - reminderTime: ' + reminderTime);

        if (owner && drugReminder && reminderTime) {
            logger.info('processDoseAdherence - updateDoseAdherence - got fields, process...eventValue: '+eventValue);

            var adherence;

            if (eventValue == 'TAKE'){
                adherence = 100;
            }
            else{
                adherence = 0;
            }

            var iReminderTime = new Date(reminderTime);

            var query = {
                owner:        req.utils.getObjectId(owner),
                drug:         req.utils.getObjectId(drug),   //if i can query w/o this, then remove from model
                drugReminder: req.utils.getObjectId(drugReminder),
                reminderTime: iReminderTime
            };

            var updateObj = {    //when document does not exist, it combines setOnInsert and set to create a new document
            	$setOnInsert: {
	                owner:              req.utils.getObjectId(owner),
	              	drug:               req.utils.getObjectId(drug),
	               	drugReminder:       req.utils.getObjectId(drugReminder),
	              	reminderTime:       iReminderTime,
	              	actualReminderTime: iReminderTime,
	              	drugEvent:          req.utils.getObjectId(eventId),
	              	status:             'active',
	          	},
	          	$set: {              //this is used only when the document exists, setOnInsert is ignored
                    adherence: adherence
                }
            };

            var options = {
				new:    true, 
				upsert: true
			};

            logger.info('processDoseAdherence - query: '+JSON.stringify(query));
            logger.info('processDoseAdherence - updateObj: '+JSON.stringify(updateObj));

            var DrugReminderAdherence = require('./../../models/DrugReminderAdherence');

            DrugReminderAdherence.update(query, updateObj, options, function(err, drugReminderDailyAdherence){
                if (err) {
                    logger.error('processDoseAdherence - update - error creating data: ' + err.message);

                    return iCallback(err);
                } 
                else {
                    logger.info('processDoseAdherence - update - successfully modified..');

                    return iCallback(null, drugReminderDailyAdherence);
                }
            });
        }
        else {
            logger.error('processDoseAdherence - updateDoseAdherence - didn\'t get all fields');
        }
    }
}
