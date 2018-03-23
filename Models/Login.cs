using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace PhiOTWeb.Models
{
    public class Login
    {
        [Key]
        public long UserID { get; set; }
        public string email { get; set; }
        public string password { get; set; }
        public int Status { get; set; }
        public System.DateTime Created_Date { get; set; }
        public System.DateTime Modified_Date { get; set; }
    }
}
