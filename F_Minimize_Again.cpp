#include <bits/stdc++.h>
using namespace std;
#define int long long

const int MAX_N = 1e7 + 5;

vector<int> calc(int n) {
    vector<bool> isprime(n + 1, true);
    
    isprime[0] = isprime[1] = false;
    
    for (int p = 2; p * p <= n; p++) {
        if (isprime[p]) {
            for (int i = p * p; i <= n; i += p)
                isprime[i] = false;
        }
    }
    vector<int> primes;
    for (int p = 2; p <= n; p++)
        if (isprime[p])
            primes.push_back(p);
    
    return primes;
}

pair<bool, int> dp[MAX_N];
bool calculated[MAX_N] = {false};

pair<bool, int> possible(int num, const vector<int>& primes) {
    if (num == 0) return {true, 0};
    if (num < 0) return {false, INT_MAX};
    
    if (calculated[num]) return dp[num];
    
    calculated[num] = true;
    dp[num] = {false, INT_MAX}; 
    
    auto it = lower_bound(primes.begin(), primes.end(), num);
    if (it != primes.end() && *it == num) {
        dp[num] = {true, 1};
        return dp[num];
    }
    
    for (int prime : primes) {
        if (prime >= num) break;
        
        pair<bool, int> subResult = possible(num - prime, primes);
        if (subResult.first) {
            dp[num].first = true;
            dp[num].second = min(dp[num].second, subResult.second + 1);
        }
    }
    
    return dp[num];
}

signed main()
{
    int t;
    cin >> t;
    vector<int> prime = calc(1e7);
    while (t--)
    {
        int n,k;
        cin >> n>>k;
        int a[n];
        unordered_map<int,int>m;

        for(int i=0;i<n;i++)
        {
            cin >> a[i];
            m[a[i]]=i;
        }
        set<int> primes(prime.begin(), prime.end());
        vector<pair<int, int>> np; 
        
        for(int i = 0; i < n; i++) {
            if(primes.find(a[i]) == primes.end()) {
                np.push_back({a[i], i});
            }
        }
        
        sort(np.begin(), np.end(), 
             [](const pair<int, int>& a, const pair<int, int>& b) {
                 return a.first > b.first;
             });
        
        int replacements = min(k, (int)np.size());
        for(int i = 0; i < replacements; i++) {
            a[np[i].second] = 2;
        }
        
        int sum = 0;
        for(int i = 0; i < n; i++) {
            if(primes.find(a[i]) != primes.end()) {
                sum += 1;
            }
            else
            sum += possible(a[i], prime).second;
        }
        cout  << sum << endl;
        
       
        
    }
    return 0;
}