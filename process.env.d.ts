type ProcessEnvShouldBeSuppliedByResources = {
MERCADOPAGO_ACCESS_TOKEN: string;
NODE_ENV: string;
}

// Override the global process variable
declare var process: {
  env: ProcessEnvShouldBeSuppliedByResources;
};
