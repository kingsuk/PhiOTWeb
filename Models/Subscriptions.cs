using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace PhiOTWeb.Models
{
    public class Subscriptions
    {
        [Key]
        public long id { get; set; }

        [Required]
        public Nullable<int> subscriptionType { get; set; }

        [Required]
        public string subscriptionName { get; set; }
        public long UserID { get; set; }
        public int status { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public System.DateTime ModifiedDate { get; set; }
    }
}
