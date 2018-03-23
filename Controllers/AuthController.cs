using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhiOTWeb.Data;
using PhiOTWeb.Models;

namespace PhiOTWeb.Controllers
{
    [Produces("application/json")]
    [Route("api/Auth")]
    public class AuthController : Controller
    {
        private ApplicationDbContext con;
        public AuthController(ApplicationDbContext applicationDbContext)
        {
            con = applicationDbContext;
        }

        [HttpPost]
        [Route("Register")]
        public IActionResult RegisterUser(Login data)
        {
            try
            {
                ResultObject result = con.ResultObject.FromSql($"[dbo].[usp_RegisterUser] {data.email}, {BCrypt.Net.BCrypt.HashPassword(data.password)}").FirstOrDefault();
                return Ok(result);
            }
            catch(Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }
    }
}