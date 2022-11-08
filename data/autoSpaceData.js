const autoSpaceCards = [
  {
      "id": "1",
      "type": "Automation",
      "title": "PTF/APAR Services",
      "content": "This service is used to query/receive/apply/applchk operations on a PTF or an apar in your system",
      "date": "2018-01-01",
      "image": "https://cdn.pixabay.com/photo/2016/04/04/14/12/monitor-1307227_960_720.jpg",
      "inputData": [
          {
              "name": "input1",
              "label": "Enter options receive/apply/applychk",
              "responsetype": "text",
              "required": true,
              "defaultvalue": "default value"
          },
          {
              "name": "input2",
              "label": "Enter csi name",
              "responsetype": "text",
              "required": true,
              "defaultvalue": "default value"
          },
    {
              "name": "input3",
              "label": "Enter System name",
              "responsetype": "text",
              "required": true,
              "defaultvalue": "default value"
          },
     {
              "name": "input4",
              "label": "Enter ptf/apar id",
              "responsetype": "text",
              "required": true,
              "defaultvalue": "default value"
          }
      ],
      "commandToExecuteInMF": "ex test.clist(sojob1) 'input1 input2 input3 input4'" ,
  },
  {
      "id": "2",
      "type": "Automation",
      "title": "DB2 Services",
      "content": "This service does the daily healthcheck,report generation against a database(s) on a system",
      "date": "2018-01-01",
      "image": "https://cdn.pixabay.com/photo/2015/07/17/22/43/student-849825_960_720.jpg",
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
              "label": "Enter tablespace name",
              "responsetype": "text",
              "required": true,
              "defaultvalue": "default value"
          }
      ],
      "commandToExecuteInMF": "ex test.clist(sojob2) 'input1 input2 input3'",
  },
  {
      "id": "3",
      "type": "Automation",
      "title": "MQ queue Services",
      "content": "This services is to update,alter,query the MQ channels",
      "date": "2018-01-01",
      "image": "https://cdn.pixabay.com/photo/2016/11/19/14/00/code-1839406_960_720.jpg",
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
      "commandToExecuteInMF": "ex z44168.test.clist(sojob3) 'input1 input2 input3'",
  },
  {
      "id": "4",
      "type": "Automation",
      "title": "APF/LNKLST/LLA services",
      "content": "Please add your content on this service here",
      "date": "2018-01-01",
      "image": "https://cdn.pixabay.com/photo/2015/01/08/18/27/startup-593341_960_720.jpg",
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
      "commandToExecuteInMF": "ex z44168.test.clist(sojob4) 'input1 input2 input3'",
  },
  {
      "id": "5",
      "type": "Automation",
      "title": "CA7 Services",
      "content": "This service is for Submit,Query,Restart,Special resources on/off,Force complete jobs in CA7",
      "date": "2018-01-01",
      "image": "https://cdn.pixabay.com/photo/2015/12/04/14/05/code-1076536_960_720.jpg",
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
      "commandToExecuteInMF": "ex z44168.test.clist(sojob5) 'input1 input2 input3 input4'",
  },
  {
      "id": "6",
      "type": "Automation",
      "title": "Testing Services",
      "content": "This is just a test invocation of the Services",
      "date": "2018-01-01",
      "image": "https://picsum.photos/200/150",
      "inputData": [
          {
              "name": "input1",
              "label": "Enter Application name",
              "responsetype": "text",
              "required": true,
              "defaultvalue": "SOJOB"
          },
      ],
      "commandToExecuteInMF": "ex 'z44168.test.clist(soops)' 'input1'",
  }
]

module.exports = autoSpaceCards;
