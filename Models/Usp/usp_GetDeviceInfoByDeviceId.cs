using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PhiOTWeb.Models.Usp
{
    public class usp_GetDeviceInfoByDeviceId
    {
        public long id { get; set; }
        public string DeviceName { get; set; }
        public Nullable<long> user_id { get; set; }
        public Nullable<int> device_type_id { get; set; }
        public int Status { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public System.DateTime ModifiedDate { get; set; }
        public long subscription_id { get; set; }
        public string device_token { get; set; }
        public System.DateTime SubscriptionModifiedDate { get; set; }
        public Nullable<long> apiCallsPerDay { get; set; }
        public Nullable<int> validity { get; set; }
        public Nullable<int> LogCountToday { get; set; }
    }
}
