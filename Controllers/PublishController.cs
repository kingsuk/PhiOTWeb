using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhiOTWeb.Data;
using PhiOTWeb.Models;
using uPLibrary.Networking.M2Mqtt;
using uPLibrary.Networking.M2Mqtt.Messages;

namespace PhiOTWeb.Controllers
{
    [Produces("application/json")]
    [Route("api/Publish")]
    public class PublishController : Controller
    {
        private readonly ApplicationDbContext applicationDbContext;
        public PublishController(ApplicationDbContext applicationDbContext)
        {
            this.applicationDbContext = applicationDbContext;
        }
        
        [HttpGet]
        [Route("publish")]
        public string Get(string topic,string message)
        {
            MqttClient client = new MqttClient("139.59.28.88");

            client.MqttMsgSubscribed += client_MqttMsgSubscribed;
            client.MqttMsgUnsubscribed += client_MqttMsgUnsubscribed;

            client.MqttMsgPublishReceived += client_MqttMsgPublishReceived;

            client.MqttMsgPublished += client_MqttMsgPublished;

            client.Connect(Guid.NewGuid().ToString());

            topic = "inTopic/" + topic;

            string[] topicName = { topic };

            byte[] qosLevels = { MqttMsgBase.QOS_LEVEL_AT_MOST_ONCE };
            client.Subscribe(topicName, qosLevels);

            string jsonDataToSend = message;

            client.Publish(topicName.FirstOrDefault(), Encoding.UTF8.GetBytes(jsonDataToSend));

            client.Unsubscribe(topicName);

            return "call done";
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
