using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace PhiOTWeb.Models
{
    public class SubscriptionTypes
    {
        [Key]
        public int id { get; set; }
        public string subscriptionTypeName { get; set; }
        public int price { get; set; }
        public int NumberOfDevices { get; set; }
        public long apiCallsPerDay { get; set; }
        public int validity { get; set; }
    }
}
