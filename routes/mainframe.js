const express = require('express');
const router = express.Router();
const fs = require('fs')
const path = require('path')
// const zip = require('express-zip');
const JSZip = require("jszip")
// require('dotenv').config()

const zowe = require('@zowe/cli')
const zowejobs = require('@zowe/zos-jobs-for-zowe-sdk')
const IssueTso = require("@zowe/zos-tso-for-zowe-sdk").IssueTso;
const ProfileInfo = require("@zowe/imperative");


let autoSpaceCards = require('../data/autoSpaceData.js');
// let dbc = require('../data/connection.js');
let connectToServer = require('../data/connection.js').connectToServer;
let insertSingleDocument = require('../data/connection.js').insertSingleDocument;
let getSingleDocument = require('../data/connection.js').getSingleDocument;
let getManyDocuments = require('../data/connection.js').getManyDocuments;
// import {connectToServer, insertSingleDocument, getSingleDocument } from '../data/connection.js';

let userTSO = process.env.MF_USER_TSO;
let paramsTSO = {};
const hostname = process.env.MF_HOST;
const port = process.env.MF_PORT;
const user = process.env.MF_USER_ZOS;
const password = process.env.MF_PASSWORD;
/*const profile = {
    hostname, port, user, password, rejectUnauthorized: false
}*/
const profile = {
    host: process.env.MF_HOST, port: process.env.MF_PORT, user: process.env.MF_USER_ZOS, password: process.env.MF_PASSWORD, rejectUnauthorized: false
};

console.log("Attempting to connect to DB...");
connectToServer();
const submittedJobsColl = "SubmittedJobs";

// Common Functions

// Function to update the JobList with 'JobSubmittedBy' field
async function updateJobList(inputList) {
    console.log("updateJobList:", inputList);
    let jobIdList = inputList.map(job => job.jobid);

    let query = { jobId: { $in: jobIdList } };
    console.log("query:", query);
    let dbCheckResponse = await getManyDocuments(submittedJobsColl, query);
    console.log("dbCheckResponse:", dbCheckResponse);
    if (dbCheckResponse.status === "success") {
        let dbList = dbCheckResponse.items;
        let dbMap = dbList.reduce((acc, curr) => {
            acc[curr.jobId] = curr;
            return acc;
        }, {});
        console.log("dbMap:", dbMap);
        let updatedList = inputList.map(job => {
            let jobId = job.jobid;
            let dbJob = dbMap[jobId];
            if (dbJob) {
                job.jobsubmittedby = dbJob.jobSubmittedBy;
            } else {
                job.jobsubmittedby = "Unknown";
            }
            return job;
        });
        console.log("updatedList:", updatedList);
        return updatedList;
    } else {
        console.log("returning inputList");
        return inputList;
    }
}

// Get job output from TSO
async function getJobOutput(jobId, jobName) {
    console.log("getJobOutput: " + jobId + " " + jobName);
    const filePath = path.resolve(`output/${jobId}/JES2`)
    console.log(filePath);

    try {
        fs.accessSync(filePath);
        const folderData = fs.readdirSync(filePath)
        console.log('Mainframe call SKIPPED... Initial local folderData:', folderData);

        const folderDataFinal = [];
        for (let file of folderData) {
            const filePath = path.resolve(`output/${jobId}/JES2/${file}`);
            const outObj = {}
            outObj.name = file;
            outObj.path= filePath;
            folderDataFinal.push(outObj);
        }
        // console.log('folderDataFinal:', folderDataFinal);
        return ({status: "success", folderDataFinal});
    } catch (err) {
        console.log("Download from Mainframe since no local output files found for job: " + jobId);
    }

    // Prepare Mainframe parameters
    const jobParms = {
        jobname: jobName,
        jobid: jobId,
        outDir: undefined,
        extension: ".txt",
        omitJobidDirectory: false
    }
    console.log(jobParms);
    
    //const session = zowe.ZosmfSession.createSessCfgFromArgs(profile);
    //const sessCfg = zowe.ZosmfSession.createSessCfgFromArgs();
    //const sessCfgWithCreds = await ConnectionPropsForSessCfg.addPropsOrPrompt<ISession>(
     //   sessCfg, profile.arguments, { parms: profile, doPrompting: true, serviceDescription: zowe.ZosmfSession.mServiceDescription });
      //  zowe.ZosmfSession.mSession = new Session(sessCfgWithCreds);
        //const profArgs = Object.entries(profile).map(([k, v]) => ({ argName: k, argValue: v }));
        //const session = ProfileInfo.createSession(profArgs);
        const sessCfg = zowe.ZosmfSession.createSessCfgFromArgs(profile);
        const sessCfgWithCreds = await ProfileInfo.ConnectionPropsForSessCfg.addPropsOrPrompt(sessCfg, profile);
        const session = new ProfileInfo.Session(sessCfgWithCreds);

    try {
        let response = await zowejobs.DownloadJobs.downloadAllSpoolContentCommon(session, jobParms);
        // console.log(response); // this is always undefined
    } catch (err) {
        console.log("error in DOWNLOADing files:");
        console.log(err)
        // res.status(400).json(err);
        return ({status: "error", message: err});
    }
    console.log("Downloaded files successfully from Mainframe");

    try {
        fs.accessSync(filePath);
        const folderData = fs.readdirSync(filePath)
        console.log('folderData:', folderData);

        const folderDataFinal = [];
        for (let file of folderData) {
            const filePath = path.resolve(`output/${jobId}/JES2/${file}`);
            const outObj = {}
            outObj.name = file;
            outObj.path= filePath;
            folderDataFinal.push(outObj);
        }
        console.log('folderDataFinal:', folderDataFinal);
        return ({status: "success", folderDataFinal});
    } catch (err) {
        console.error(err)
        return ({status: "error", message: err});
    }   
}

/* GET home page. */
router.get('/', function(req, res) {
  // res.render('index', { title: 'Express' });
  console.log('Inside MF router get /')
  res.send("try /mf/getjoblist")
});

router.post('/postsojobs', async (req, res) => {
    console.log('Inside MF router post /postsojobs');
    console.log("req.body: ", req.body);


    //# TODO - get job name from req.body and update command

    let command = `ex 'z44168.test.clist(soops)' 'SOJOB'`;
    try {
        //const session = zowe.ZosmfSession.createSessCfgFromArgs(profile);
        const sessCfg = zowe.ZosmfSession.createSessCfgFromArgs(profile);
        const sessCfgWithCreds = await ProfileInfo.ConnectionPropsForSessCfg.addPropsOrPrompt(sessCfg, profile);
        const session = new ProfileInfo.Session(sessCfgWithCreds);
        let response = await IssueTso.issueTsoCommand(session, userTSO, command, paramsTSO);
        console.log("original response --------------------------------------------------");
        console.log(response)
        console.log("original response --------------------------------------------------");
        if (response && response.success) {
            let responseStr = response.commandResponse;
            console.log("responseStr --------------------------------------------------");
            console.log(responseStr);
            console.log("responseStr --------------------------------------------------");
            if (!responseStr || responseStr.length == 0) {
                res.status(201).json({message: 'Invalid or No response from Mainframe'});
            }
            responseStr = responseStr.replace(/\n/g, '');
            responseStr = responseStr.replace(/</g, '[');
            responseStr = responseStr.replace(/>/g, ']');
            // responseStr = responseStr.replace(/ /g, '');
            responseStr = responseStr.replace(/READY/g, '');
            console.log("formatted responseStr --------------------------------------------------");
            console.log(responseStr);
            console.log("formatted responseStr --------------------------------------------------");
            try {
                let outputJSON = JSON.parse(responseStr);
                if (outputJSON.status === 'success') {
                    let doc = {
                        jobId: outputJSON.jobid,
                        jobName: outputJSON.jobname,
                        jobStatus: outputJSON.status,
                        jobSubmittedBy: "SOJOB1",   //#TODO - update this by the correct value from req.body
                    }
                    insertSingleDocument(submittedJobsColl, doc);
                    console.log('Job submitted and saved to DB successfully');
                    res.status(201).json(JSON.parse(responseStr));
                } else {
                    res.status(201).json({message: 'Invalid or No response from Mainframe'});
                }
            } catch (error) {
                console.log(error);
                res.status(201).json({message: 'Invalid JSON format from Mainframe'});
            }
        } else {
            res.status(201).json({message: 'Invalid or No response from Mainframe'});
        }
    } catch (err) {
        console.log(err)
        res.status(500).json(err);
    }
});

router.get('/getbulletin', async (req, res) => {
    console.log('Inside MF router get /getbulletin');
    console.log("req.body: ", req.body);
    
    let command = `ex 'z44168.test.clist(soops)' 'BULLETIN'`;
    try {
        //const sessCfgWithCreds = await ConnectionPropsForSessCfg.addPropsOrPrompt(sessCfg, params.arguments, { doPrompting: true, parms: params });
        //const session = new Session(sessCfgWithCreds);
        //const session = zowe.ZosmfSession.createSessCfgFromArgs(profile)
        console.log("Callinggg --------------------------------------------------");
        //const session = zowe.ZosmfSession.createSessCfgFromArgs(profile);
        //const profArgs = Object.entries(profile).map(([k, v]) => ({ argName: k, argValue: v }));
        const sessCfg = zowe.ZosmfSession.createSessCfgFromArgs(profile);
        const sessCfgWithCreds = await ProfileInfo.ConnectionPropsForSessCfg.addPropsOrPrompt(sessCfg, profile);
        const session = new ProfileInfo.Session(sessCfgWithCreds);
        console.log("after Callinggg --------------------------------------------------"+session);

        let response = await IssueTso.issueTsoCommand(session, userTSO, command, paramsTSO);
        console.log("original response --------------------------------------------------");
        console.log(response)
        console.log("original response --------------------------------------------------");
        if (response && response.success) {
            let responseStr = response.commandResponse;
            console.log("responseStr --------------------------------------------------");
            console.log(responseStr);
            console.log("responseStr --------------------------------------------------");
            if (!responseStr || responseStr.length == 0) {
                res.status(201).json({message: 'Invalid or No response from Mainframe'});
            }
            responseStr = responseStr.replace(/READY/g, '');
            responseStr = responseStr.replace(/\n/g, '');
            responseStr = responseStr.replace(/</g, '[');
            responseStr = responseStr.replace(/>/g, ']');
            // responseStr = responseStr.replace(/ /g, '');
            console.log("formatted responseStr --------------------------------------------------");
            console.log(responseStr);
            console.log("formatted responseStr --------------------------------------------------");
            try {
                JSON.parse(responseStr);
                res.status(201).json(JSON.parse(responseStr));
            } catch (error) {
                console.log(error);
                res.status(201).json({message: 'Invalid JSON format from Mainframe'});
            }
        } else {
            res.status(201).json({message: 'Invalid or No response from Mainframe'});
        }
    } catch (err) {
        console.log(err)
        res.status(500).json(err);
    }
});

router.get('/getjoblistD', async (req, res) => {
    console.log('Inside MF router get /getjoblistD');
    let responseObj = [
        {
            "owner": "Z44168",
            "phase": 20,
            "subsystem": "JES2",
            "phase-name": "Job is on the hard copy queue",
            "job-correlator": "J0007558SVSCJES2DAFCA022.......:",
            "type": "JOB",
            "url": "https://192.86.32.67:10443/zosmf/restjobs/jobs/J0007558SVSCJES2DAFCA022.......%3A",
            "jobid": "JOB07557",
            "class": "A",
            "files-url": "https://192.86.32.67:10443/zosmf/restjobs/jobs/J0007558SVSCJES2DAFCA022.......%3A/files",
            "jobname": "Z44168SD",
            "status": "OUTPUT",
            "retcode": "JCL RUNNING",
            "jobsubmittedby": "BATCH1",
        },
        {
            "owner": "Z44168",
            "phase": 20,
            "subsystem": "JES2",
            "phase-name": "Job is on the hard copy queue",
            "job-correlator": "J0007558SVSCJES2DAFCA022.......:",
            "type": "JOB",
            "url": "https://192.86.32.67:10443/zosmf/restjobs/jobs/J0007558SVSCJES2DAFCA022.......%3A",
            "jobid": "JOB07558",
            "class": "A",
            "files-url": "https://192.86.32.67:10443/zosmf/restjobs/jobs/J0007558SVSCJES2DAFCA022.......%3A/files",
            "jobname": "Z44168SD",
            "status": "OUTPUT",
            "retcode": "JCL ERROR",
            "jobsubmittedby": "Unknown",
        },
        {
            "owner": "Z44168",
            "phase": 20,
            "subsystem": "JES2",
            "phase-name": "Job is on the hard copy queue",
            "job-correlator": "J0007558SVSCJES2DAFCA022.......:",
            "type": "JOB",
            "url": "https://192.86.32.67:10443/zosmf/restjobs/jobs/J0007558SVSCJES2DAFCA022.......%3A",
            "jobid": "JOB07559",
            "class": "A",
            "files-url": "https://192.86.32.67:10443/zosmf/restjobs/jobs/J0007558SVSCJES2DAFCA022.......%3A/files",
            "jobname": "Z44168SD",
            "status": "OUTPUT",
            "retcode": "JCL SUCCESS",
            "jobsubmittedby": "Automation Service 1",
        },
    ];
    console.log("No Mainframe call, dummy data sent");
    res.status(201).json(responseObj);
});

router.get('/getbulletinD', async (req, res) => {
    console.log('Inside MF router get /getbulletinD');
    let responseObj = {
        "success": true,
        "data": [
            {
                "id": "1",
                "type": "bulletin",
                "title": "Mainframe upgrade completed",
                "content": "Mainframe upgrade has been completed after a successfull 34hours operation, all users are requested to check their BAU and report for issues ",
                "date": "2022-04-01"
            },
            {
                "id": "2",
                "type": "bulletin",
                "title": "Mainframe townhall",
                "content": "Mainframe townhall has been planned on July13th 0300hrs, CEO presenting the roadmap for the next five years",
                "date": "2022-04-01"
            },
            {
                "id": "3",
                "type": "breakingnews",
                "title": "Prime application outage",
                "content": "Prime application impacted after a change performed last night, techies are under rescue. all users are requested to save your data in the prime application.",
                "date": "2022-04-01"
            },
            {
                "id": "4",
                "type": "breakingnews",
                "title": "Timesheet closing today",
                "content": "All users are requested to close their timesheet before EOD, the timesheets will locked off for the monthend maintenance.",
                "date": "2022-04-01"
            },
            {
                "id": "5",
                "t ype": "breakingnews",
                "title": "Stockholm Site under maintenance",
                "content": "Stockhlm site is under maintenance, hence jobs running for Stockholm rerouted to Vancover",
                "date": "2022-04-01"
            }
        ]
    }
    console.log("No Mainframe call, dummy data sent");
    res.status(201).json(responseObj);
});

router.get('/getmonitoringD', async (req, res) => {
    console.log('Inside MF router get /getmonitoringD');
    let responseObj = {
        "success": true,
        "commandResponse": {
            "cpupercentage": [
                {
                    "datetime": "2022-04-01T00:10:00.000Z",
                    "value": 65.7
                },
                {
                    "datetime": "2022-04-01T00:20:00.000Z",
                    "value": 66.7
                },
                {
                    "datetime": "2022-04-01T00:30:00.000Z",
                    "value": 68.7
                },
                {
                    "datetime": "2022-04-01T00:40:00.000Z",
                    "value": 69.7
                },
                {
                    "datetime": "2022-04-01T00:50:00.000Z",
                    "value": 72.9
                },
                {
                    "datetime": "2022-04-01T01:00:00.000Z",
                    "value": 85.2
                }
            ],
            "spoolpercent": [
                {
                    "datetime": "2022-04-01T00:10:00.000Z",
                    "value": 45.7
                },
                {
                    "datetime": "2022-04-01T00:20:00.000Z",
                    "value": 46.7
                },
                {
                    "datetime": "2022-04-01T00:30:00.000Z",
                    "value": 58.2
                },
                {
                    "datetime": "2022-04-01T00:40:00.000Z",
                    "value": 65.5
                },
                {
                    "datetime": "2022-04-01T00:50:00.000Z",
                    "value": 66.1
                },
                {
                    "datetime": "2022-04-01T01:00:00.000Z",
                    "value": 68.7
                }
            ],
            "smfpercent": [
                {
                    "datetime": "2022-04-01T00:10:00.000Z",
                    "value": 45.7
                },
                {
                    "datetime": "2022-04-01T00:20:00.000Z",
                    "value": 46.7
                },
                {
                    "datetime": "2022-04-01T00:30:00.000Z",
                    "value": 48.7
                },
                {
                    "datetime": "2022-04-01T00:40:00.000Z",
                    "value": 45.7
                },
                {
                    "datetime": "2022-04-01T00:50:00.000Z",
                    "value": 46.7
                },
                {
                    "datetime": "2022-04-01T01:00:00.000Z",
                    "value": 58.7
                }
            ],
            "lastUpdate": "2022-04-01T01:23:00.000Z",
            "wtor": [
                "33,BUFFERSHORTAGEPRESENTINSYSTEM",
                "42,CICSDOWN,PERFORMRECOVERY",
                "53,REPLYDEVICENAMEORCANCEL"
            ],
            "healthChecker": [
                "HZS0002ECHECK(IBMXCF,XCF_SFM_ACTIVE):882",
                "IXCH0514EThestateofSysplexFailureManagementisNOTconsistent",
                "withtheIBMXCFrecommendation."
            ],
            "automationstatus": "Error",
            "prodjobs": [
                {
                    "jobid": "JOB0104",
                    "jobname": "FUD0001",
                    "jobstatus": "AWAITING",
                    "jobtype": "PROD",
                    "jobpriority": "HIGH",
                    "jobstarttime": "2022-04-01T00:00:00.000Z",
                    "jobendtime": "2022-04-01T00:00:00.000Z",
                    "jobduration": "00:00:00",
                    "jobpercentage": "100.00",
                    "jobdescription": "FUDAPPLICATION"
                },
                {
                    "jobid": "JOB0204",
                    "jobname": "PEOPLE8",
                    "jobstatus": "LONGRUNNING",
                    "jobtype": "PROD",
                    "jobpriority": "HIGH",
                    "jobstarttime": "2022-04-01T00:00:00.000Z",
                    "jobendtime": "2022-04-01T00:00:00.000Z",
                    "jobduration": "00:00:00",
                    "jobpercentage": "100.00",
                    "jobdescription": "Peoplesoftapplication"
                }
            ],
            "jobabends": [
                {
                    "jobid": "JOB0508",
                    "jobname": "QUEBEC9",
                    "jobstatus": "ERROR",
                    "jobstarttime": "2022-04-01T12:10:00.000Z",
                    "jobendtime": "2022-04-01T12:15:00.000Z"
                },
                {
                    "jobid": "JOB2290",
                    "jobname": "ALBIN89",
                    "jobstatus": "ERROR",
                    "jobstarttime": "2022-04-01T02:45:00.000Z",
                    "jobendtime": "2022-04-01T02:53:00.000Z"
                },
                {
                    "jobid": "JOB2909",
                    "jobname": "COFFIN6",
                    "jobstatus": "ERROR",
                    "jobstarttime": "2022-04-01T04:23:00.000Z",
                    "jobendtime": "2022-04-01T04:23:10.000Z"
                },
                {
                    "jobid": "JOB1947",
                    "jobname": "JARVIS3",
                    "jobstatus": "ERROR",
                    "jobstarttime": "2022-04-01T05:35:00.000Z",
                    "jobendtime": "2022-04-01T05:43:00.000Z"
                }
            ]
        }
    }
    console.log("No Mainframe call, dummy data sent");
    res.status(201).json(responseObj);
});

router.get('/getmonitoring', async (req, res) => {
    console.log('Inside MF router get /getmonitoring');
    console.log("req.body: ", req.body);
    
    let command = `ex 'z44168.test.clist(soops)' 'MONIT'`;
    try {
        const sessCfg = zowe.ZosmfSession.createSessCfgFromArgs(profile);
        const sessCfgWithCreds = await ProfileInfo.ConnectionPropsForSessCfg.addPropsOrPrompt(sessCfg, profile);
        const session = new ProfileInfo.Session(sessCfgWithCreds);
       // const session = zowe.ZosmfSession.createSessCfgFromArgs(profile)
        let response = await IssueTso.issueTsoCommand(session, userTSO, command, paramsTSO);
        console.log("original response --------------------------------------------------");
        console.log(response)
        console.log("original response --------------------------------------------------");
        if (response && response.success) {
            let responseStr = response.commandResponse;
            console.log("responseStr --------------------------------------------------");
            console.log(responseStr);
            console.log("responseStr --------------------------------------------------");
            if (!responseStr || responseStr.length == 0) {
                res.status(201).json({message: 'Invalid or No response from Mainframe'});
            }
            responseStr = responseStr.replace(/READY/g, '');
            responseStr = responseStr.replace(/\n/g, '');
            responseStr = responseStr.replace(/</g, '[');
            responseStr = responseStr.replace(/>/g, ']');
            // responseStr = responseStr.replace(/ /g, '');
            console.log("formatted responseStr --------------------------------------------------");
            console.log(responseStr);
            console.log("formatted responseStr --------------------------------------------------");
            try {
                JSON.parse(responseStr);
                res.status(201).json(JSON.parse(responseStr));
            } catch (error) {
                console.log(error);
                res.status(201).json({message: 'Invalid JSON format from Mainframe'});
            }
        } else {
            res.status(201).json({message: 'Invalid or No response from Mainframe'});
        }
    } catch (err) {
        console.log(err)
        res.status(500).json(err);
    }
});

router.get('/getautospacecards', async (req, res) => {
    console.log('Inside MF router get /getautospacecards');
    console.log("req.body: ", req.body);
    res.status(201).json(autoSpaceCards);
});

router.post('/commandTSO', async (req, res) => {
    console.log('------- commandTSO start -------');
    console.log("req.body", req.body)
    let command = req.body.command
    console.log("command", command)

    if (command && command.length) {
        try {
            //const session = zowe.ZosmfSession.createSessCfgFromArgs(profile);
            const sessCfg = zowe.ZosmfSession.createSessCfgFromArgs(profile);
            const sessCfgWithCreds = await ProfileInfo.ConnectionPropsForSessCfg.addPropsOrPrompt(sessCfg, profile);
            const session = new ProfileInfo.Session(sessCfgWithCreds);
            let response = await IssueTso.issueTsoCommand(session, userTSO, command, paramsTSO);
        //     console.log(response)
        //     if (response && response.success) {
        //         res.status(201).json(response.commandResponse);
        //     } else {
        //         res.status(201).json({message: 'No response'});
        //     }
        // } catch (err) {
        //     console.log(err)
        //     res.status(500).json(err);
        // }

            console.log("original response --------------------------------------------------");
            console.log(response)
            console.log("original response --------------------------------------------------");
            if (response && response.success) {
                let responseStr = response.commandResponse;
                console.log("responseStr --------------------------------------------------");
                console.log(responseStr);
                console.log("responseStr --------------------------------------------------");
                if (!responseStr || responseStr.length == 0) {
                    res.status(201).json({message: 'Invalid or No response from Mainframe'});
                }
                responseStr = responseStr.replace(/\n/g, '');
                responseStr = responseStr.replace(/</g, '[');
                responseStr = responseStr.replace(/>/g, ']');
                // responseStr = responseStr.replace(/ /g, '');
                responseStr = responseStr.replace(/READY/g, '');
                console.log("formatted responseStr --------------------------------------------------");
                console.log(responseStr);
                console.log("formatted responseStr --------------------------------------------------");
                try {
                    let outputJSON = JSON.parse(responseStr);
                    if (outputJSON.status === 'success') {
                        let doc = {
                            jobId: outputJSON.jobid,
                            jobName: outputJSON.jobname,
                            jobStatus: outputJSON.status,
                            jobSubmittedBy: "Auto Space Service",   //#TODO - update this by the correct value from req.body
                        }
                        insertSingleDocument(submittedJobsColl, doc);
                        console.log('Job submitted and saved to DB successfully');
                        res.status(201).json(JSON.parse(responseStr));
                    } else {
                        res.status(201).json({message: 'Invalid or No response from Mainframe'});
                    }
                } catch (error) {
                    console.log(error);
                    res.status(201).json({message: 'Invalid JSON format from Mainframe'});
                }
            } else {
                res.status(201).json({message: 'Invalid or No response from Mainframe'});
            }
        } catch (err) {
            console.log(err)
            res.status(500).json(err);
        }
    } else {
        res.status(400).json('command is invalid or empty');
    }
});
 
router.post('/commandZOS', async (req, res) => {
    console.log('------- commandZOS start -------');
    console.log("req.body", req.body)
    let command = req.body.command
    console.log("command", command)
    if (command && command.length) {
        try {
            //const session = zowe.ZosmfSession.createSessCfgFromArgs(profile);
            const sessCfg = zowe.ZosmfSession.createSessCfgFromArgs(profile);
            const sessCfgWithCreds = await ProfileInfo.ConnectionPropsForSessCfg.addPropsOrPrompt(sessCfg, profile);
            const session = new ProfileInfo.Session(sessCfgWithCreds);
            let response = await zowe.IssueCommand.issueAndCollect(session, {command}, {});
            console.log(response)
            if (response && response.success) {
                res.status(201).json(response.commandResponse);
            } else {
                res.status(201).json({message: 'No response'});
            }
        } catch (err) {
            console.log(err)
            res.status(500).json(err);
        }
    } else {
        res.status(500).json('command is empty');
    }
 });

router.post('/submitjob', async (req, res) => {
    console.log('Inside MF router post /submitjob')
    console.log(req.body)
    let jobname = req.body.jobname;
    if (jobname) {
        try {
            //const session = zowe.ZosmfSession.createSessCfgFromArgs(profile);
            const sessCfg = zowe.ZosmfSession.createSessCfgFromArgs(profile);
            const sessCfgWithCreds = await ProfileInfo.ConnectionPropsForSessCfg.addPropsOrPrompt(sessCfg, profile);
            const session = new ProfileInfo.Session(sessCfgWithCreds);
            const jobOutput = await zowe.SubmitJobs.submitJob(session, jobname);
            console.log("response-----------------------------------------------------");
            console.log(jobOutput);
            console.log("response-----------------------------------------------------");
            if (jobOutput.jobid) {
                let responseObj = {}
                responseObj.jobId = jobOutput.jobid;
                responseObj.jobName = jobOutput.jobname;
                responseObj.jobStatus = jobOutput.status;
                responseObj.jobSubmittedBy = "QuerySpace BATCH JOB",   //#TODO - update this by the correct value from req.body
                await insertSingleDocument(submittedJobsColl, responseObj);
                res.status(201).json(responseObj);
            } else {
                res.status(500).json(jobOutput);
            }
        } catch (err) {
            console.log(err)
            res.status(500).json(err);
        }
    } else {
        res.status(400).json({
            message: 'jobname is required'
        })
    }
});

router.get('/getjoblist', async (req, res) => {
    console.log('Inside MF router get /mf/getjoblist')

    try {
        //const session = zowe.ZosmfSession.createSessCfgFromArgs(profile);
        const sessCfg = zowe.ZosmfSession.createSessCfgFromArgs(profile);
        const sessCfgWithCreds = await ProfileInfo.ConnectionPropsForSessCfg.addPropsOrPrompt(sessCfg, profile);
        const session = new ProfileInfo.Session(sessCfgWithCreds);
        let response = await zowejobs.GetJobs.getJobsByOwner(session, profile.user);
        console.log("response-----------------------------------------------------");
        console.log( response)
        console.log("response-----------------------------------------------------");
        if (response && response.length) {
            let updatedJobList = await updateJobList(response);
            res.status(200).json(updatedJobList)
        } else {
            console.log('No jobs found')
            res.status(404).json({
                message: 'No jobs found'
            })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Error getting jobs'
        })
    }
});

// router.post('/getoutputfilenamesD', async (req, res) => {
//     console.log('Inside MF router get /getoutputfilenamesD');
//     let responseObj = [
//         "JOB07867:JESJCL.txt",
//         "JOB07867:JESMSGLG.txt",
//         "JOB07867:JESYSMSG.txt"
//     ];
//     console.log("No Mainframe call, dummy data sent");
//     res.status(201).json(responseObj);
// });

router.post('/getoutputfilenames', async (req, res) => {
    console.log('Inside MF router post /getoutputfilenames')
    console.log(req.body)
    let jobid = req.body.jobid;
    let jobname = req.body.jobname;
    if (jobid && jobname) {
        let folderDataResp = await getJobOutput(jobid, jobname);
        if (folderDataResp && folderDataResp.status === 'success') {
            // console.log("folderDataResp-----------------------------------------------------");
            // console.log( folderDataResp)
            // console.log("folderDataResp-----------------------------------------------------");
            if (folderDataResp.folderDataFinal && folderDataResp.folderDataFinal.length) {
                let fileNames = folderDataResp.folderDataFinal.map(file => `${jobid}:${file.name}`);
                res.status(200).json(fileNames)
            } else {
                console.log('No files found')
                res.status(404).json({
                    message: 'No files found'
                })
            }
        } else {
            console.log('Error getting files')
            res.status(500).json({
                message: 'Error getting files'
            })
        }
    } else {
        res.status(400).json({
            message: 'jobid and jobname are required'
        })
    }
});

router.post('/getsinglefile', async (req, res) => {  
    console.log(req.body);
    let jobid = req.body.jobid;
    let filename = req.body.filename;
    let mode = req.body.mode;
    console.log(`${jobid} ${filename}`);

    if (filename && jobid) {        
        try {

            // option 1 - using sendFile
            let options = {
                root: path.join('output'),
                dotfiles: 'deny',
                headers: {
                    'x-timestamp': Date.now(),
                    'x-sent': true
                }
            };
            if (mode === 'view') {
                let newfilename = `${jobid}/JES2/${filename}`;
                console.log(newfilename);
                res.sendFile(newfilename, options, (err) => {
                    if (err) {
                        console.log(err);
                        res.status(500).json({
                            message: 'Error getting file'
                        })
                    } else {
                        console.log('Sent success::', newfilename);
                    }
                });
            } else if (mode === 'download') {
                const filePath = path.resolve(`output/${jobid}/JES2/${filename}`);
                console.log(filePath);
                const file = fs.readFileSync(filePath);
                console.log(file);
                console.log(file.toString());
                console.log('sending file');
                res.setHeader('Content-disposition', 'attachment; filename=' + filename);
                res.setHeader('Content-type', 'text/plain');
                // res.send(file);
                res.status(200).download(filePath, filename);
            }

            // // option 2 - using json(file)
            // const filePath = path.resolve(`output/${jobid}/JES2/${filename}`);
            // console.log(filePath);
            // const file = fs.readFileSync(filePath);
            // console.log(file);
            // console.log(file.toString());
            // console.log('sending file');
            // res.status(200).json(file);

            // // option 3 - using download(file)
            // const filePath = path.resolve(`output/${jobid}/JES2/${filename}`);
            // console.log(filePath);
            // const file = fs.readFileSync(filePath);
            // console.log(file);
            // console.log(file.toString());
            // console.log('sending file');
            // res.status(200).sendFile(file, {}, (err) => {
            //     if (err) {
            //         console.log(err);
            //         res.status(500).json({
            //             message: 'Error getting file'
            //         })
            //     } else {
            //         console.log('Sent file');
            //     }
            // });
            // res.status(200).download(file, 'outfile.txt');
    
        } catch (err) {
            console.error(err)
            res.status(500).json(err);
        }   
    } else {
        res.status(400).json({
            message: 'jobid and filename are required'
        })
    }
});

router.post('/getoutputzip', async (req, res) => {  
    console.log("Inside MF router post /getoutputzip");
    console.log(req.body);
    let jobname = req.body.jobname;
    let jobid = req.body.jobid;
    console.log(`${jobid} ${jobname}`);
    
    let folderData = await getJobOutput(jobid, jobname);
    console.log("folderData-----------------------------------------------------");
    console.log( folderData)
    console.log("folderData-----------------------------------------------------");
    if (folderData && folderData.status === 'success') {
        console.log("folderDataFinal-----------------------------------------------------");
        console.log( folderData.folderDataFinal)
        console.log("folderDataFinal-----------------------------------------------------");
        if (folderData.folderDataFinal && folderData.folderDataFinal.length) {
            let filePaths = folderData.folderDataFinal.map(file => file.path);
            // let fileNames = folderData.folderDataFinal.map(file => `${jobid}:${file.name}`);
            console.log("filePaths-----------------------------------------------------");
            console.log( filePaths)
            console.log("filePaths-----------------------------------------------------");
            let zip = new JSZip();
            folderData.folderDataFinal.forEach(fileObj => {
                // let filePath = path.resolve(`output/${jobid}/JES2/${file}`);
                // console.log(filePath);
                let file = fileObj.name;
                let filePath = fileObj.path;
                let fileData = fs.readFileSync(filePath);
                console.log(fileData);
                zip.file(file, fileData);
            });
            // let zipData = zip.generate({
            //     type: 'nodebuffer'
            // });
            zip.generateAsync({type:"nodebuffer"})
            .then(function(content) {
                // // see FileSaver.js
                // saveAs(content, "example.zip");
                res.setHeader("Content-Type", "application/zip");
                res.status(200).send(content);
            });
            // console.log(zipData);
            // res.status(200).send(zipData);
        } else {
            console.log('No files found')
            res.status(404).json({
                message: 'No files found'
            })
        }
    } else {
        console.log('Error getting files')
        res.status(500).json({
            message: 'Error getting files'
        })
    }
});

module.exports = router;

