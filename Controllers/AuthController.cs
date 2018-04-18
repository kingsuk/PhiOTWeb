using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using PhiOTWeb.Data;
using PhiOTWeb.Models;

namespace PhiOTWeb.Controllers
{
    [Produces("application/json")]
    [Route("api/Auth")]
    public class AuthController : Controller
    {
        private IConfiguration _config;
        private ApplicationDbContext con;
        public AuthController(ApplicationDbContext applicationDbContext, IConfiguration config)
        {
            con = applicationDbContext;
            _config = config;
        }

        [HttpGet]
        [Route("test")]
        [Authorize]
        public IActionResult test()
        {
            //var header = User.Claims.Select(c =>
            //            new
            //            {
            //                Type = c.Type,
            //                Value = c.Value
            //            });
            string header = User.Claims.Where(x => x.Type == "user_email").FirstOrDefault().Value;
            //var header = User.Claims.Select(c => c.Type == );
            //var header = ((ClaimsIdentity)User.Identity);

            return Ok(header);
        }

        [HttpGet]
        [Route("AuthAttempt")]
        public IActionResult AuthAttempt(Login login)
        {
            try
            {

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                Login result = con.Login.FromSql($"[dbo].[usp_CheckUser] {login.email}").FirstOrDefault();

                if(result != null)
                {
                    if(BCrypt.Net.BCrypt.Verify(login.password, result.password))
                    {
                        ResultObject resultObject = new ResultObject()
                        {
                            StatusCode = 1,
                            StatusMessage = "Login successful.",
                        };

                        //return Ok(resultObject);

                        var claims = new[]
                        {
                            new Claim("user_email", result.email),
                            new Claim("user_id", result.UserID.ToString())
                        };

                        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
                        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                        //var token = new JwtSecurityToken(
                        //    claims: claims,
                        //    expires: DateTime.Now.AddMinutes(30),
                        //    signingCredentials: creds
                        //  );

                       
                        var token = new JwtSecurityToken(
                            issuer: _config["Jwt:Issuer"],
                            audience: _config["Jwt:Issuer"],
                            claims: claims,
                            notBefore: DateTime.Now,
                            expires: DateTime.Now.AddDays(30),
                            signingCredentials: creds
                        );

                        return Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) , email = login.email });

                    }
                    else
                    {
                        return StatusCode(403,new ResultObject() { StatusMessage = "Invalid user name of password." });
                    }
                    
                }
                else
                {
                    return StatusCode(403, new ResultObject() { StatusMessage = "You are not registered with us. Please register." });
                }
                
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }

        [HttpGet]
        [Route("Register")]
        public IActionResult RegisterUser(Login data)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                TryValidateModel(data);
                ResultObject result = con.ResultObject.FromSql($"[dbo].[usp_RegisterUser] {data.email}, {BCrypt.Net.BCrypt.HashPassword(data.password)}").FirstOrDefault();
                if(result.StatusCode==1)
                {
                    return Ok(result);
                }
                else
                {
                    return StatusCode(409, result);
                }
                
            }
            catch(Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }
    }
}