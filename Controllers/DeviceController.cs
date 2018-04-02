using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PhiOTWeb.Data;

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

        [HttpGet]
        [Route("AddNewDevice")]
        [Authorize]
        public IActionResult AddNewDevice()
        {
            string user_id = User.Claims.Where(x => x.Type == "user_id").FirstOrDefault().Value;
            return StatusCode(200,"ok");
        }
    }
}