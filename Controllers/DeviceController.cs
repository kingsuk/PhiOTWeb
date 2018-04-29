using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using PhiOTWeb.Data;
using PhiOTWeb.Models;

namespace PhiOTWeb.Controllers
{
    [Produces("application/json")]
    [Route("api/Device")]
    public class DeviceController : Controller
    {
        private ApplicationDbContext con;
        private IConfiguration _config;
        public DeviceController(ApplicationDbContext applicationDbContext, IConfiguration config)
        {
            con = applicationDbContext;
            _config = config;
        }

        [HttpGet]
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

                device.user_id = Convert.ToInt64(User.Claims.Where(x => x.Type == "user_id").FirstOrDefault().Value);
                device.device_token = (device.DeviceName.Replace(" ", String.Empty) + Guid.NewGuid().ToString("N")).Substring(0,Convert.ToInt32(_config["CustomConfigs:TokenLength"]));
                ResultObject result = con.ResultObject.FromSql($"[phi].[usp_AddNewDevice] {device.DeviceName},{device.user_id},{device.device_type_id},{device.subscription_id},{device.device_token}").FirstOrDefault();

                return StatusCode(200, result);
            }
            catch(Exception e)
            {
                return StatusCode(500,e.Message);
            }
            
        }

        [HttpGet]
        [Route("DeleteDeviceByDeviceAndUserId")]
        [Authorize]
        public IActionResult DeleteDeviceByDeviceAndUserId(Device device)
        {
            try
            {
                //if (!ModelState.IsValid)
                //{
                //    return BadRequest(ModelState);
                //}

                device.user_id = Convert.ToInt64(User.Claims.Where(x => x.Type == "user_id").FirstOrDefault().Value);
                ResultObject result = con.ResultObject.FromSql($"[phi].[usp_DeleteDeviceByDeviceAndUserId] {device.id},{device.user_id}").FirstOrDefault();

                return StatusCode(200, result);
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }

        }

        [HttpGet]
        [Route("GetAllDevicesByUser")]
        [Authorize]
        public IActionResult GetAllDevicesByUser()
        {
            try
            {
                var user_id = User.Claims.Where(x => x.Type == "user_id").FirstOrDefault().Value;
                
                List<Device> result = con.Device.FromSql($"[phi].[GetDevicesByUserId] {user_id}").ToList();

                return StatusCode(200, result);
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }

        }

        [HttpGet]
        [Route("GetDeviceInfoByDeviceId")]
        //[Authorize]
        public IActionResult GetDeviceInfoByDeviceId(int deviceId)
        {
            try
            {

                Device result = con.Device.FromSql($"[phi].[usp_GetDeviceInfoByDeviceId] {deviceId}").FirstOrDefault();
                int days = DateTime.Now.Subtract(result.SubscriptionModifiedDate).Days;
                if (days>result.validity)
                {
                    return StatusCode(403, "Your subscription has expired!");
                }

                return StatusCode(200, result);
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }

        }
    }
}