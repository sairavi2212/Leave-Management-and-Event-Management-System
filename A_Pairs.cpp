#include <bits/stdc++.h>
using namespace std;
#define int long long
signed main()
{
    int t;
    cin >> t;
    while (t--)
    {
        int n;
        cin >> n;
        int ans=1;
        for(int i=1;i<=64;i++)
        {

            if((n>>i)&1LL==1)
            ans*=3;
        }
        cout << ans << endl;
    }
    return 0;
}