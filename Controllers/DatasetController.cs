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
    [Route("api/Dataset")]
    public class DatasetController : Controller
    {
        private readonly ApplicationDbContext con;
        private IConfiguration _config;

        public DatasetController(ApplicationDbContext applicationDbContext, IConfiguration config)
        {
            con = applicationDbContext;
            _config = config;
        }

        [HttpGet]
        [Authorize]
        [Route("GetAllDataset")]
        public IActionResult GetAllDataset()
        {
            try
            {
                List<Dataset> list = con.Dataset.FromSql("[phi].[GetAllDatasets]").ToList();
                return Ok(list);
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }

        [HttpGet]
        [Authorize]
        [Route("GetAllDatasetByUserIdAndDeviceId")]
        public IActionResult GetAllDatasetByUserIdAndDeviceId(Dataset dataset)
        {
            try
            {
                long User_id = Convert.ToInt64(User.Claims.Where(x => x.Type == "user_id").FirstOrDefault().Value);
                List<Dataset> list = con.Dataset.FromSql($"[phi].[GetAllDatasetsByUserIdAndDeviceId] {dataset.ds_deviceId},{User_id}").ToList();
                return Ok(list);
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }

        [HttpGet]
        [Authorize]
        [Route("CreateNewDataset")]
        public IActionResult CreateNewDataset(Dataset dataset)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                dataset.ds_userId = Convert.ToInt64(User.Claims.Where(x => x.Type == "user_id").FirstOrDefault().Value);
                ResultObject result = con.ResultObject.FromSql($"[phi].[CreateNewDataset] {dataset.ds_name},{dataset.ds_userId},{dataset.ds_deviceId},{dataset.jsonData},{dataset.reverseJsonData}").FirstOrDefault();
                return Ok(result);
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }

        [HttpGet]
        [Authorize]
        [Route("EditDatasetByDsIdAndUserId")]
        public IActionResult EditDatasetByDsIdAndUserId(Dataset dataset)
        {
            try
            {
                //if (!ModelState.IsValid)
                //{
                //    return BadRequest(ModelState);
                //}
                dataset.ds_userId = Convert.ToInt64(User.Claims.Where(x => x.Type == "user_id").FirstOrDefault().Value);
                ResultObject result = con.ResultObject.FromSql($"[phi].[EditDataset] {dataset.ds_id},{dataset.ds_userId},{dataset.jsonData},{dataset.reverseJsonData}").FirstOrDefault();
                return Ok(result);
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }

        [HttpGet]
        [Authorize]
        [Route("DeleteDatasetByDsIdAndUserId")]
        public IActionResult DeleteDatasetByDsIdAndUserId(Dataset dataset)
        {
            try
            {
                //if (!ModelState.IsValid)
                //{
                //    return BadRequest(ModelState);
                //}
                dataset.ds_userId = Convert.ToInt64(User.Claims.Where(x => x.Type == "user_id").FirstOrDefault().Value);
                ResultObject result = con.ResultObject.FromSql($"[phi].[DeleteDataset] {dataset.ds_id},{dataset.ds_userId}").FirstOrDefault();
                return Ok(result);
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }

    }
}