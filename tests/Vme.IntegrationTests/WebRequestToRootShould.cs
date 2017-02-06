using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

using FluentAssertions;

using JetBrains.Annotations;

using Xunit;


namespace Vme.IntegrationTests
{
	public class WebRequestToRootShould
		: IClassFixture<WebHostFixture<Startup>>
	{
		[NotNull] private readonly HttpClient _client;

		public WebRequestToRootShould( WebHostFixture<Startup> fixture )
		{
			_client = fixture.Client;
		}

		[Fact]
		public async Task ReturnHtmlPage()
		{
			var response = await _client.GetAsync( "/" );

			Assert.NotNull( response );
			response.StatusCode.Should().Be( HttpStatusCode.OK );
		}

		[Fact]
		public async Task ReturnAssemblyVersion()
		{
			var response = await _client.GetAsync( "/version" );
			Assert.NotNull( response );
			response.EnsureSuccessStatusCode();
			response.Content.Should().NotBeNull();
			string content = await response.Content.ReadAsStringAsync();
			content.Should().NotBeNullOrEmpty();
		}
	}
}