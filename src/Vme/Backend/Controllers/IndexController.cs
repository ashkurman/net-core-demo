using Microsoft.AspNetCore.Mvc;

using Vme.Backend.Model;


// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Vme.Backend.Controllers
{
	[Route("")]
	public class IndexController : Controller
	{
		[HttpGet]
		public IActionResult Get()
		{
			return View("Index", new IndexViewSettings() { LastFmEnabled = true } ); //todo: flag must be based on presence/validness of an apikey
		}
	}
}
