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
    }
}
