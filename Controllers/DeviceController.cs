using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhiOTWeb.Data;
using PhiOTWeb.Models;

namespace PhiOTWeb.Controllers
{
    [Produces("application/json")]
    [Route("api/Device")]
    public class DeviceController : Controller
    {
        private ApplicationDbContext con;
        public DeviceController(ApplicationDbContext applicationDbContext)
        {
            con = applicationDbContext;
        }

        [HttpPost]
        [Route("AddNewDevice")]
        [Authorize]
        public IActionResult AddNewDevice(Device device)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                device.user_id = User.Claims.Where(x => x.Type == "user_id").FirstOrDefault().Value;
                ResultObject result = con.ResultObject.FromSql($"[phi].[usp_AddNewDevice] {device.DeviceName},{device.user_id},{device.device_type_id},{device.subscription_id},{device.device_token}").FirstOrDefault();

                return StatusCode(200, result);
            }
            catch(Exception e)
            {
                return StatusCode(500,e.Message);
            }
            
        }
    }
}