using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ac_server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HealthController : ControllerBase
    {
        public HealthController()
        {

        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            return Ok("Art Access Backend works.");
        }
    }
}
