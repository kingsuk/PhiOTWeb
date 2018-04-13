using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace PhiOTWeb.Models
{
    public class PublishLog
    {
        [Key]
        public long p_id { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string token { get; set; }
        public long User_id { get; set; }
        public string message { get; set; }
    }
}
