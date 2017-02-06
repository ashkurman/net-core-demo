using System;

using JetBrains.Annotations;

using Microsoft.AspNetCore.Mvc;

using Vme.Backend.Engine;


namespace Vme.Backend.Controllers
{
	[Route("/version")]
	public class VersionController : Controller
	{
		private readonly IProgramVersion _programVersion;

		[HttpGet]
		public IActionResult Get()
		{
			string version = _programVersion.GetInformationalVersion();
			if ( version == null )
				return NotFound();

			return new ObjectResult( version );
		}

		/// <inheritdoc />
		public VersionController( [NotNull] IProgramVersion programVersion )
		{
			if ( programVersion == null ) throw new ArgumentNullException( nameof( programVersion ) );

			_programVersion = programVersion;
		}
	}
}