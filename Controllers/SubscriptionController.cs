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
    [Route("api/Subscription")]
    public class SubscriptionController : Controller
    {
        private ApplicationDbContext con;
        public SubscriptionController(ApplicationDbContext applicationDbContext)
        {
            con = applicationDbContext;
        }

        [HttpGet]
        [Route("GetAllSubscriptions")]
        public IActionResult GetAllSubscriptions()
        {
            try
            {
                List<SubscriptionTypes> list = con.SubscriptionTypes.FromSql("[phi].[usp_GetAllSubscriptionTypes]").ToList();
                return Ok(list);
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }


        [HttpPost]
        [Route("AddNewSubscription")]
        [Authorize]
        public IActionResult AddNewSubscription(Subscriptions subscription)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                subscription.UserID = User.Claims.Where(x => x.Type == "user_id").FirstOrDefault().Value;
                ResultObject result = con.ResultObject.FromSql($"[phi].[usp_createNewSubscription] {subscription.subscriptionType},{subscription.subscriptionName},{subscription.UserID}").FirstOrDefault();

                return StatusCode(200, result);
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }
    }
}