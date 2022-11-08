const autoSpaceCards = [
    {
        "id": "1",
        "type": "Automation",
        "title": "PTF/APAR Services",
        "content": "This service is used to query/receive/apply/applchk operations on a PTF or an apar in your system",
        "date": "2018-01-01",
        "image": "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png",
        "inputData": [
            {
                "name": "input1",
                "label": "Enter PTF/APAR",
                "responsetype": "text",
                "required": true,
                "defaultvalue": "default value"
            },
            {
                "name": "input2",
                "label": "Enter PTF/APAR id",
                "responsetype": "text",
                "required": true,
                "defaultvalue": "default value"
            },
	    {
                "name": "input3",
                "label": "Enter Product DSI name",
                "responsetype": "text",
                "required": true,
                "defaultvalue": "default value"
            },
	     {
                "name": "input4",
                "label": "Enter system name",
                "responsetype": "text",
                "required": true,
                "defaultvalue": "default value"
            }
        ],
        "commandToExecuteInMF": "ex z44168.test.clist('sojob1') 'input1 input2 input3 input4'" ,
    },
    {
        "id": "2",
        "type": "Automation",
        "title": "DB2 Services",
        "content": "This service does the daily healthcheck,report generation against a database(s) on a system",
        "date": "2018-01-01",
        "image": "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png",
        "inputData": [
            {
                "name": "input1",
                "label": "Enter systemname",
                "responsetype": "text",
                "required": true,
                "defaultvalue": "default value"
            },
            {
                "name": "input2",
                "label": "Enter Report/healthchk name",
                "responsetype": "text",
                "required": true,
                "defaultvalue": "default value"
            },
	    {
                "name": "input3",
                "label": "Enter Db2 name",
                "responsetype": "text",
                "required": true,
                "defaultvalue": "default value"
            }
        ],
        "commandToExecuteInMF": "ex z44168.test.clist('sojob2') 'input1 input2 input3'",
    },
    {
        "id": "3",
        "type": "Automation",
        "title": "MQ queue Services",
        "content": "This services is to update,alter,query the MQ channels",
        "date": "2018-01-01",
        "image": "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png",
        "inputData": [
            {
                "name": "input1",
                "label": "Enter System name",
                "responsetype": "text",
                "required": true,
                "defaultvalue": "default value"
            },
            {
                "name": "input2",
                "label": "Enter UPDATE/ALTER/QUERY",
                "responsetype": "text",
                "required": true,
                "defaultvalue": "default value"
            },
	    {
                "name": "input3",
                "label": "Enter Queue name",
                "responsetype": "text",
                "required": true,
                "defaultvalue": "default value"
            }
        ],
        "commandToExecuteInMF": "ex z44168.test.clist('sojob3') 'input1 input2 input3'",
    },
    {
        "id": "4",
        "type": "Automation",
        "title": "APF/LNKLST/LLA services",
        "content": "",
        "date": "2018-01-01",
        "image": "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png",
        "inputData": [
            {
                "name": "input1",
                "label": "Enter APF/LNKLST/LLA",
                "responsetype": "text",
                "required": true,
                "defaultvalue": "default value"
            },
            {
                "name": "input2",
                "label": "Enter UPDATE/ADD/QUERY",
                "responsetype": "text",
                "required": true,
                "defaultvalue": "default value"
            },
    	    {
                "name": "input3",
                "label": "Queue name",
                "responsetype": "text",
                "required": true,
                "defaultvalue": "default value"
            }
        ],
        "commandToExecuteInMF": "ex z44168.test.clist('sojob4') 'input1 input2 input3'",
    },
    {
        "id": "5",
        "type": "Automation",
        "title": "CA7 Services",
        "content": "This service is for Submit,Query,Restart,Special resources on/off,Force complete jobs in CA7",
        "date": "2018-01-01",
        "image": "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png",
        "inputData": [
            {
                "name": "input1",
                "label": "Enter Application name",
                "responsetype": "text",
                "required": true,
                "defaultvalue": "default value"
            },
            {
                "name": "input2",
                "label": "Enter Jobname",
                "responsetype": "text",
                "required": true,
                "defaultvalue": "default value"
            },
            {
                "name": "input3",
                "label": "Enter WS id",
                "responsetype": "text",
                "required": true,
                "defaultvalue": "default value"
            },
    	    {
                "name": "input4",
                "label": "Enter anyone option SUBMIT/QUERY/RESTART/Special RESOURCES/FC",
                "responsetype": "text",
                "required": true,
                "defaultvalue": "default value"
            }
        ],
        "commandToExecuteInMF": "ex z44168.test.clist('sojob5') 'input1 input2 input3 input4'",
    }
]

module.exports = autoSpaceCards;