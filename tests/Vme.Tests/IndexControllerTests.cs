using FluentAssertions.Mvc;

using Vme.Backend.Controllers;

using Xunit;


namespace Vme.Tests
{
	public class IndexControllerTests
	{
		public class Get
		{
			[Fact]
			public void ShouldReturnView()
			{
				var controller = new IndexController();
				var result = controller.Get();
				result.Should().BeViewResult();
			}
		}
	}
}