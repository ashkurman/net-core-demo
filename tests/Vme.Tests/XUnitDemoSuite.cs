using FluentAssertions;

using Xunit;


namespace Vme.Tests
{
	/// <summary>
	/// Used to check if xUnit feels fine on .net core
	/// </summary>
	public class XUnitDemoSuite
	{
		int Add( int x, int y ) => x + y;

		[Fact]
		public void PassingTest()
		{
			var result = Add( 2, 2 );
			result.Should().Be( 4 );
		}

		[Fact]
		public void FailingTest()
		{
			var result = Add( 2, 2 );
			result.Should().Be( 5 );
		}

	}
}
