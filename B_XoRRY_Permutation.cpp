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
        int ans[n];
        int count = 1;
        for (int i = n - 2; i >= 0; i -= 2)
        {
            ans[i] = count;
            count++;
        }
        count = n;
        for (int i = n - 1; i >= 0; i-=2)
        {
            ans[i] = count;
            count--;
        }
        for (int i = 0; i < n; i++)
        {
            cout << ans[i] << " ";
        }
        cout << endl;
    }
    return 0;
}