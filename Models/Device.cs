using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace PhiOTWeb.Models
{
    public class Device
    {
        [Key]
        public long id { get; set; }

        [Required]
        public string DeviceName { get; set; }
        public string user_id { get; set; }

        [Required]
        public Nullable<int> device_type_id { get; set; }
        public int Status { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public System.DateTime ModifiedDate { get; set; }

        [Required]
        public Nullable<long> subscription_id { get; set; }

        [Required]
        public string device_token { get; set; }
        
    }
}
