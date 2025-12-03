// ============================================================================
// OPENNEXT CONFIGURATION FOR WHOPSHIP
// ============================================================================
// This config prepares your Next.js app for deployment on WhopShip,
// which uses AWS Lambda with OpenNext under the hood.
//
// Key settings:
// - Streaming responses enabled for better performance
// - Optimized for Lambda cold starts
// - Memory and timeout tuned for serverless
//
// Note: OpenNext types are installed during the build process, not locally.
// ============================================================================

const config = {
  // Default configuration for the main server function
  default: {
    // Use Lambda's streaming response mode for better performance
    // This allows responses larger than 6MB (up to 20MB with streaming)
    override: {
      wrapper: 'aws-lambda-streaming',
    },
  },

  // Middleware configuration (runs at the edge, before your pages)
  // middleware: {
  //   external: true, // Deploy middleware separately for better cold starts
  // },

  // Build command configuration
  buildCommand: 'npx --yes @opennextjs/aws build',

  // Dangerous settings - only enable if you know what you're doing
  dangerous: {
    // Disable tag cache to reduce DynamoDB costs
    // Only disable if you're not using on-demand revalidation
    // disableTagCache: true,

    // Disable incremental cache to reduce S3 costs
    // Only disable if you're not using ISR (Incremental Static Regeneration)
    // disableIncrementalCache: true,
  },
}

export default config

