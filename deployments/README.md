# Deployments

Bu klasör, deploy edilen contract adreslerini saklar.

## Yapı

```
deployments/
└── localhost/
    └── deployment.json
```

## deployment.json Format

Deploy script'i çalıştırıldığında otomatik olarak oluşturulur:

```json
{
  "network": "localhost",
  "chainId": 31337,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "contracts": {
    "VesikaCoin": {
      "address": "0x...",
      "deployer": "0x..."
    },
    "VesikaSale": {
      "address": "0x...",
      "deployer": "0x..."
    },
    "ArtistTokenFactory": {
      "address": "0x...",
      "deployer": "0x..."
    },
    "TokenSwap": {
      "address": "0x...",
      "deployer": "0x..."
    }
  }
}
```

## Not

`localhost/` klasörü `.gitignore` ile ignore edilmiştir çünkü her local deployment farklı adreslere sahip olacaktır.
