using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace PhiOTWeb.Models
{
    public class Dataset
    {
        [Key]
        public long ds_id { get; set; }

        [Required]
        public string ds_name { get; set; }
        public Nullable<long> ds_userId { get; set; }
        [Required]
        public string jsonData { get; set; }
        [Required]
        public string reverseJsonData { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public System.DateTime ModifiedDate { get; set; }
    }
}
