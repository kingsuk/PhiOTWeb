using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace PhiOTWeb.Models
{
    public class ResultObject
    {
        [Key]
        public int StatusCode { get; set; }
        public string StatusMessage { get; set; }
    }
}
