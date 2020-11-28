const AWS= require('aws-sdk');
exports.handler=async (event,context)=>{
    try{
        const table=process.env.table;
        const docClient= new AWS.DynamoDB();
        console.log("connected to DynamoDB");
        // const messageID= event.Records[0].Sns.MessageId;
        const fun=(s)=>{
            var hash = 0, i, chr;
            for (i = 0; i < s.length; i++) {
              chr   = s.charCodeAt(i);
              hash  = ((hash << 5) - hash) + chr;
              hash |= 0; // Convert to 32bit integer
            }
            return hash;
          }
        const messageID=fun(event.Records[0].Sns.Message);
        var params={
            TableName:table,
            Key:{
                "id":{
                    N: `${messageID}`
                }
            }
        };
        const {Item}=await docClient.getItem(params).promise();
        if(Item){
            console.log("Duplicate message found");
            return;
        }
        var put_params={
            TableName:table,
            Item:{
                "id":{
                    N: `${messageID}`
                }
            }
        };
        await docClient.putItem(put_params).promise();
        console.log("Created record in DynamoDb");
        const message =JSON.parse(event.Records[0].Sns.Message);
        console.log(message);
        const body=`<!DOCTYPE html>
        <html>
        <head>
        <title>Notification</title>
        <style>
        body {
          background-color: black;
          text-align: center;
          color: white;
          font-family: Arial, Helvetica, sans-serif;
        }
        </style>
        </head>
        <body>
        ${message.answer_url?'<h2> Answer has been posted/updated </h2>':'<h2>An answer has been deleted</h2>'}
        <p>User email: ${message.user_email}</p>
        <p>Question id: ${message.question_id}</p>
        ${message.answer_url?``:``}<p>Answer id: ${message.answer_id}</p>
        <p>Time: ${message.updated_timestamp?message.updated_timestamp:message.created_timestamp}</p>
        <a href=${message.question_url}>${message.question_url}</a>
        ${message.answer_url?`<p>Time: ${message.updated_timestamp?message.updated_timestamp:message.created_timestamp}</p>
        <a href=${message.answer_url}>${message.answer_url}</a>
        <p>Answer Text: ${message.answer_text}</p>`:``}
        </body>
        </html>`
        var emailParams={
            Destination:{
                ToAddresses: [
                    message.owner_email
                 ]
            },
            Message:{
                Body:{
                    Html:{
                        Charset: "UTF-8",
                        Data:body
                    }
                },
                Subject:{
                    Data:"Update for your question",
                    Charset: "UTF-8"
                }
            },
            Source:`admin@${process.env.account}.trivedhaudurthi.me`
        }
        const data=await new AWS.SES().sendEmail(emailParams).promise();
        console.log('sent email successfully');
    }   
    catch(err){
        console.log(err);
    }
}