```cs
public static void Main(string[] args)
		{
		  var strTest1 = " fly me to the moon "; //true
		  var strTest2 = "  сел в   озере  березов лес"; // false
		  
			Console.WriteLine(IsPalindrome(strTest1));
			Console.WriteLine(IsPalindrome(strTest2));
		}
		
		private static bool IsPalindrome(string str)
		{
		  int left = 0;
		  int right = str.Length - 1;
		  
		  
		  while(left < right)
		  {
		    while(str[left] == ' ') left++;
		    while(str[right] == ' ') right--;
		    
		    if(left >= right) break;
		    
		    if(str[left] != str[right]) return false;
		    
		    left++;
		    right--;
		  }
		  return true;
		}
```