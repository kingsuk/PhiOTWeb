using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using PhiOTWeb.Data;
using PhiOTWeb.Models;
using uPLibrary.Networking.M2Mqtt;
using uPLibrary.Networking.M2Mqtt.Messages;

namespace PhiOTWeb.Controllers
{
    [Produces("application/json")]
    [Route("api/publish")]
    public class PublishController : Controller
    {
        private readonly ApplicationDbContext con;
        private IConfiguration _config;

        public PublishController(ApplicationDbContext applicationDbContext, IConfiguration config)
        {
            con = applicationDbContext;
            _config = config;
        }

        [HttpGet]
        [Authorize]
        [Route("GetAllPublishLog")]
        public IActionResult GetAllPublishLog()
        {
            try
            {
                List<PublishLog> list = con.PublishLog.FromSql("[dbo].[usp_GetAllPublishLog]").ToList();
                return Ok(list);
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }

        [HttpGet]
        [Authorize]
        [Route("GetPublishLogByUserId")]
        public IActionResult GetPublishLogByUserId(PublishLog publishLog)
        {
            try
            {
                publishLog.User_id = Convert.ToInt64(User.Claims.Where(x => x.Type == "user_id").FirstOrDefault().Value);
                List<PublishLog> list = con.PublishLog.FromSql($"[dbo].[usp_GetPublishLogByUserId] {publishLog.User_id}").ToList();
                return Ok(list);
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }

        [HttpGet]
        [Authorize]
        [Route("GetPublishLogByUserToken")]
        public IActionResult GetPublishLogByUserToken(PublishLog publishLog)
        {
            try
            {
                long User_id = Convert.ToInt64(User.Claims.Where(x => x.Type == "user_id").FirstOrDefault().Value);
                List<PublishLog> list = con.PublishLog.FromSql($"[dbo].[usp_GetPublishLogByUserToken] {publishLog.token},{User_id}").ToList();
                return Ok(list);
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }

        [HttpGet]
        [Authorize]
        [Route("sendToDevice")]
        public IActionResult sendToDevice(PublishLog publishLog)
        {
            try
            {
                MqttClient client = new MqttClient(_config["MqttConfig:Mqtt_Server"]);

                client.MqttMsgSubscribed += client_MqttMsgSubscribed;
                client.MqttMsgUnsubscribed += client_MqttMsgUnsubscribed;

                client.MqttMsgPublishReceived += client_MqttMsgPublishReceived;

                client.MqttMsgPublished += client_MqttMsgPublished;

                client.Connect(Guid.NewGuid().ToString());

                string topic = _config["MqttConfig:Publish_Topic"] + publishLog.token;

                string[] topicName = { topic };

                byte[] qosLevels = { MqttMsgBase.QOS_LEVEL_AT_MOST_ONCE };
                client.Subscribe(topicName, qosLevels);

                string jsonDataToSend = publishLog.message;

                client.Publish(topicName.FirstOrDefault(), Encoding.UTF8.GetBytes(jsonDataToSend));

                //client.Unsubscribe(topicName);

                long User_id = Convert.ToInt64(User.Claims.Where(x => x.Type == "user_id").FirstOrDefault().Value);
                ResultObject result = con.ResultObject.FromSql($"[dbo].[usp_CreatePublishLog] {publishLog.token},{User_id},{publishLog.message}").FirstOrDefault();
                
                return Ok(result);
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }

            
        }

        private static void client_MqttMsgPublished(object sender, MqttMsgPublishedEventArgs e)
        {
            Console.WriteLine("Message is published " + e.MessageId.ToString());
            throw new NotImplementedException();
        }

        private static void client_MqttMsgSubscribed(object sender, MqttMsgSubscribedEventArgs e)
        {
            Console.WriteLine("Message Subscribed " + e.MessageId.ToString());
            //throw new NotImplementedException();
        }

        private static void client_MqttMsgUnsubscribed(object sender, MqttMsgUnsubscribedEventArgs e)
        {
            Console.WriteLine("Message UnSubscribed " + e.MessageId.ToString());
            //throw new NotImplementedException();
        }

        private static void client_MqttMsgPublishReceived(object sender, MqttMsgPublishEventArgs e)
        {
            Console.WriteLine("Message received " + System.Text.Encoding.UTF8.GetString(e.Message));
            //throw new NotImplementedException();
        }

       
    }
}
