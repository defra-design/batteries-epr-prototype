import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'path'
import CopyPlugin from 'copy-webpack-plugin'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import { WebpackAssetsManifest } from 'webpack-assets-manifest'

const { NODE_ENV = 'development' } = process.env

const require = createRequire(import.meta.url)
const dirname = path.dirname(fileURLToPath(import.meta.url))

const govukFrontendPath = path.dirname(
  require.resolve('govuk-frontend/package.json')
)

const ruleTypeAssetResource = 'asset/resource'

export default {
  context: path.resolve(dirname, 'src/client'),
  entry: {
    application: {
      import: ['./javascripts/application.js', './stylesheets/application.scss']
    },
    signIn: './javascripts/signIn/entry.js',
    signOut: './javascripts/signOut/entry.js',
    dashboard: './javascripts/dashboard/entry.js',
    publicRegisterSearch: './javascripts/publicRegister/search/entry.js',
    publicRegisterDetail: './javascripts/publicRegister/detail/entry.js',
    onboarding: './javascripts/onboarding/entry.js',
    onboardingConfirmation: './javascripts/onboardingConfirmation/entry.js',
    annualReturnSmallTonnages:
      './javascripts/annualReturn/smallProducer/tonnages/entry.js',
    annualReturnSmallDeclaration:
      './javascripts/annualReturn/smallProducer/declaration/entry.js',
    annualReturnSmallConfirmation:
      './javascripts/annualReturn/smallProducer/confirmation/entry.js',
    annualReturnIaCategories:
      './javascripts/annualReturn/ia/categories/entry.js',
    annualReturnIaTonnages: './javascripts/annualReturn/ia/tonnages/entry.js',
    annualReturnIaDeclaration:
      './javascripts/annualReturn/ia/declaration/entry.js',
    annualReturnIaConfirmation:
      './javascripts/annualReturn/ia/confirmation/entry.js',
    annualReturnSchemeRepresented:
      './javascripts/annualReturn/schemeRepresented/entry.js',
    serviceCharge: './javascripts/serviceCharge/entry.js',
    paymentDetails: './javascripts/paymentDetails/entry.js',
    account: './javascripts/account/entry.js',
    accountScheme: './javascripts/account/scheme/entry.js',
    leaveScheme: './javascripts/leaveScheme/entry.js',
    devReset: './javascripts/devReset/entry.js',
    devData: './javascripts/devData/entry.js',
    devTimeTravel: './javascripts/devTimeTravel/entry.js',
    timeTravelShim: './javascripts/timeTravelShim/entry.js',
    complianceSchemeDashboard: './javascripts/complianceScheme/entry.js',
    complianceSchemeSignIn: './javascripts/complianceScheme/signIn/entry.js',
    complianceSchemeApplication:
      './javascripts/complianceScheme/application/entry.js',
    complianceSchemeMembers:
      './javascripts/complianceScheme/members/entry.js',
    complianceSchemeQuarterly:
      './javascripts/complianceScheme/quarterly/entry.js',
    complianceSchemeIa: './javascripts/complianceScheme/ia/entry.js',
    complianceSchemeEvidence:
      './javascripts/complianceScheme/evidence/entry.js',
    complianceSchemeObligation:
      './javascripts/complianceScheme/obligationPage/entry.js',
    complianceSchemeRegister:
      './javascripts/complianceScheme/register/entry.js',
    regulatorSignIn: './javascripts/regulator/signIn/entry.js',
    regulatorDashboard: './javascripts/regulator/dashboard/entry.js',
    regulatorTargets: './javascripts/regulator/targets/entry.js',
    regulatorSchemes: './javascripts/regulator/schemes/entry.js',
    regulatorOperators: './javascripts/regulator/operators/entry.js',
    regulatorProducers: './javascripts/regulator/producers/entry.js',
    regulatorEvidence: './javascripts/regulator/evidence/entry.js',
    regulatorSubmissions: './javascripts/regulator/submissions/entry.js',
    operatorSignIn: './javascripts/operator/signIn/entry.js',
    operatorDashboard: './javascripts/operator/dashboard/entry.js',
    operatorApplication: './javascripts/operator/application/entry.js',
    operatorEvidence: './javascripts/operator/evidence/entry.js',
    operatorQuarterly: './javascripts/operator/quarterly/entry.js',
    operatorAnnualReturn: './javascripts/operator/annualReturn/entry.js',
    niEubr: './javascripts/ni/eubr/entry.js',
    niOnboardingPersist: './javascripts/ni/onboarding/persist/entry.js',
    niAnnualReturnPersist: './javascripts/ni/annualReturn/persist/entry.js',
    niDashboard: './javascripts/ni/dashboard/entry.js',
    niObligation: './javascripts/ni/obligation/entry.js',
    niProductRequirements: './javascripts/ni/productRequirements/entry.js'
  },
  experiments: {
    outputModule: true
  },
  mode: NODE_ENV === 'production' ? 'production' : 'development',
  devtool: NODE_ENV === 'production' ? 'source-map' : 'inline-source-map',
  watchOptions: {
    aggregateTimeout: 200,
    poll: 1000
  },
  output: {
    filename:
      NODE_ENV === 'production'
        ? 'javascripts/[name].[contenthash:7].min.js'
        : 'javascripts/[name].js',

    chunkFilename:
      NODE_ENV === 'production'
        ? 'javascripts/[name].[chunkhash:7].min.js'
        : 'javascripts/[name].js',

    path: path.join(dirname, '.public'),
    publicPath: '/public/',
    libraryTarget: 'module',
    module: true
  },
  resolve: {
    alias: {
      '/public/assets': path.join(govukFrontendPath, 'dist/govuk/assets')
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|mjs|scss)$/,
        loader: 'source-map-loader',
        enforce: 'pre'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          browserslistEnv: 'javascripts',
          cacheDirectory: true,
          extends: path.join(dirname, 'babel.config.cjs'),
          presets: [['@babel/preset-env']]
        },
        sideEffects: false
      },
      {
        test: /\.scss$/,
        type: ruleTypeAssetResource,
        generator: {
          binary: false,
          filename:
            NODE_ENV === 'production'
              ? 'stylesheets/[name].[contenthash:7].min.css'
              : 'stylesheets/[name].css'
        },
        use: [
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                loadPaths: [
                  path.join(dirname, 'src/client/stylesheets'),
                  path.join(dirname, 'src/server/common/components'),
                  path.join(dirname, 'src/server/common/templates/partials')
                ],
                quietDeps: true,
                sourceMapIncludeSources: true,
                style: 'expanded'
              },
              warnRuleAsWarning: true
            }
          }
        ]
      },
      {
        test: /\.(png|svg|jpe?g|gif)$/,
        type: ruleTypeAssetResource,
        generator: {
          filename: 'assets/images/[name][ext]'
        }
      },
      {
        test: /\.(ico)$/,
        type: ruleTypeAssetResource,
        generator: {
          filename: 'assets/images/[name][ext]'
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: ruleTypeAssetResource,
        generator: {
          filename: 'assets/fonts/[name][ext]'
        }
      }
    ]
  },
  optimization: {
    minimize: NODE_ENV === 'production',
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: { passes: 2 },
          format: { comments: false },
          sourceMap: {
            includeSources: true
          },
          safari10: true
        }
      })
    ],
    providedExports: true,
    sideEffects: true,
    usedExports: true
  },
  plugins: [
    new CleanWebpackPlugin(),
    new WebpackAssetsManifest(),
    new CopyPlugin({
      patterns: [
        {
          from: path.join(govukFrontendPath, 'dist/govuk/assets'),
          to: 'assets',
          globOptions: {
            ignore: [
              path.join(govukFrontendPath, 'dist/govuk/assets/rebrand'),
              path.join(govukFrontendPath, 'dist/govuk/assets/images')
            ]
          }
        },
        {
          from: path.join(govukFrontendPath, 'dist/govuk/assets/rebrand'),
          to: 'assets'
        }
      ]
    })
  ],
  stats: {
    errorDetails: true,
    loggingDebug: ['sass-loader'],
    preset: 'minimal'
  },
  target: 'browserslist:javascripts'
}
