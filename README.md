# Picasarts subgraph

## Installation
- Install nodejs and yarn 
- Install graph-cli

  `yarn global add @graphprotocol/graph-cli`
- Access and create subgraph on The Graph: https://thegraph.com then authenticate with access token:

  `graph auth --product hosted-service <ACCESS_TOKEN>`
- Config subgraph and deploy command: marketsubgraph/subgraph.yaml, marketsubgraph/package.json, nftsubgraph/subgraph.yaml, nftsubgraph/package.json
- Install node_modules and deploy subgraph

  `cd marketsubgraph && yarn install && yarn run-deploy && cd .. && cd nftsubgraph && yarn install && yarn run-deploy`

## Reference document
- https://thegraph.com/docs/en/supported-networks/near/
