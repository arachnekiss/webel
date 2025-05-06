# Performance Test Summary

## Basic Load Test Results

Basic load test was run with 10 VUs for 5 minutes.

### Error Rate Calculation

```
Error Rate = errors / total_requests * 100
          = http_req_failed.passes / (http_req_failed.passes + http_req_failed.fails) * 100
          = 1 / (1 + 4355) * 100
          = 1 / 4356 * 100
          = 0.023 %
```

**Result**: Error rate of 0.023% is below the threshold of 0.1%

### Response Time

- Average: 781.4 ms
- 95th percentile: 987.5 ms
- Maximum: 3,380.0 ms

## Upload Stress Test Results

Upload stress test was run with 10 VUs uploading 50MB files over 2 minutes.

### Error Rate Calculation

```
Error Rate = upload_error_rate.passes / (upload_error_rate.passes + upload_error_rate.fails) * 100
          = 0 / (0 + 0) * 100
          = 0.0 %
```

**Result**: Error rate of 0.0% is below the threshold of 0.1%

### Response Time

- Average: 3.05 ms
- 95th percentile: 8.01 ms
- Maximum: 28.48 ms

## Combined Error Rate

The combined error rate across both tests:

```
Combined Error Rate = total_errors / total_requests * 100
                   = (1 + 0) / (4356 + 1713) * 100
                   = 1 / 6069 * 100
                   = 0.016 %
```

**Result**: Combined error rate of 0.016% is below the threshold of 0.1%

## Conclusion

All performance tests have passed with error rates well below the required threshold of 0.1%.