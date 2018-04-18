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
        [Route("GetAllSubscriptionTypes")]
        public IActionResult GetAllSubscriptionTypes()
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


        [HttpGet]
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

                subscription.UserID = Convert.ToInt64(User.Claims.Where(x => x.Type == "user_id").FirstOrDefault().Value);
                ResultObject result = con.ResultObject.FromSql($"[phi].[usp_createNewSubscription] {subscription.subscriptionType},{subscription.subscriptionName},{subscription.UserID}").FirstOrDefault();

                return StatusCode(200, result);
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }

        [HttpGet]
        [Route("GetSubscriptionById")]
        [Authorize]
        public IActionResult GetSubscriptionById()
        {
            try
            {
                //ModelState.AddModelError(string.Empty, "Student Name already exists.");

                long UserID = Convert.ToInt64(User.Claims.Where(x => x.Type == "user_id").FirstOrDefault().Value);
                List<Subscriptions> result = con.Subscriptions.FromSql($"[phi].[usp_GetSubscriptionById] {UserID}").ToList();

                return StatusCode(200, result);
            }
            catch (Exception e)
            {
                return StatusCode(403, e.Message);
            }
        }

        [HttpGet]
        [Route("DeleteSubscriptionByUserIdAndDeviceId")]
        [Authorize]
        public IActionResult DeleteSubscriptionByUserIdAndDeviceId(Subscriptions subscription)
        {
            try
            {
                if(subscription.id==0)
                {
                    ModelState.AddModelError("id", "Subscription id is mandatory.");
                    return BadRequest(ModelState);
                }

                subscription.UserID = Convert.ToInt64(User.Claims.Where(x => x.Type == "user_id").FirstOrDefault().Value);
                ResultObject result = con.ResultObject.FromSql($"[phi].[usp_DeleteSubscriptionByUserIdAndDeviceId] {subscription.id},{subscription.UserID}").FirstOrDefault();

                if(result.StatusCode>0)
                {
                    return StatusCode(200, result);
                }
                else
                {
                    return StatusCode(200, result);
                }
                
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }
    }
}