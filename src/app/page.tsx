'use client'

import { useState, useEffect } from 'react'
import { AuthType, AuthConfig } from '@/types/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ApiResult {
  success: boolean;
  data?: {
    status?: boolean;
    data?: number;
  };
  isValid?: number;
  status?: string;
  error?: string;
}

interface TestCase {
  response: {
    status: boolean;
    data: number;
  };
  expectedResult: number;
}

export default function Home() {
  const [apiUrl, setApiUrl] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [verificationExpression, setVerificationExpression] = useState('')
  const [result, setResult] = useState<ApiResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [authType, setAuthType] = useState<AuthType>('none')
  const [authConfig, setAuthConfig] = useState<AuthConfig>({
    type: 'none',
    username: '',
    password: '',
    token: '',
    apiKey: '',
    headerKey: '',
    inHeader: true
  })
  const [isExpressionValid, setIsExpressionValid] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const updatedBody = {
        apiUrl,
        walletAddress,
        verificationExpression,
        auth: authConfig
      }

      const response = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedBody),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error:', error)
      setResult({ success: false, error: 'Failed to test API' })
    } finally {
      setLoading(false)
    }
  }

  const getFunctionString = () => {
    if (!verificationExpression) return '';
    return `function (response) {\n  ${verificationExpression.trim()}\n}`;
  };

  const testExpression = () => {
    try {
      // Test cases to verify the expression works correctly
      const testCases: TestCase[] = [
        { response: { status: true, data: 1 }, expectedResult: 1 },
        { response: { status: false, data: 1 }, expectedResult: 0 },
        { response: { status: true, data: 0 }, expectedResult: 0 }
      ];

      const testFunction = new Function('response', verificationExpression);

      const allTestsPassed = testCases.every(test =>
        testFunction(test.response) === test.expectedResult
      );

      setIsExpressionValid(allTestsPassed);
    } catch (error) {
      setIsExpressionValid(false);
    }
  };

  // Add to useEffect or wherever appropriate
  useEffect(() => {
    testExpression();
  }, [verificationExpression]);

  const getCompleteUrl = (baseUrl: string, walletAddress: string, auth: AuthConfig) => {
    if (!baseUrl || !walletAddress) return '';

    const url = new URL(baseUrl);
    url.searchParams.append('walletAddress', walletAddress);

    // Add API Key as query param if configured
    if (auth.type === 'apiKey' && !auth.inHeader && auth.headerKey && auth.apiKey) {
      url.searchParams.append(auth.headerKey, auth.apiKey);
    }

    return url.toString();
  };

  return (
    <main className="min-h-screen p-8 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto mb-12">
        <h1 className="text-3xl font-bold mb-4 text-center dark:text-white">Bandit Offchain API Tester</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>About This Tool</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>
              This tool helps you test and configure off-chain REST API tasks for the Bandit Network.
              It allows you to verify task completion through external APIs or services.
            </p>
            <p>
              You can:
            </p>
            <ul>
              <li>Test your API endpoint with different wallet addresses</li>
              <li>Configure and test authentication methods</li>
              <li>Validate your verification logic</li>
              <li>Get the properly formatted expression for your task configuration</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Once you've confirmed your API and expression are working correctly, you can copy the verified expression
              to use in your campaign's task configuration.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* Left Column - Input Forms */}
        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">API Endpoint:</label>
                <Input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Wallet Address:</label>
                <Input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Verification Logic:</label>
                <Textarea
                  value={verificationExpression}
                  onChange={(e) => setVerificationExpression(e.target.value)}
                  className="font-mono"
                  rows={5}
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium">Authentication:</label>
                <Select
                  value={authType}
                  onValueChange={(value: AuthType) => {
                    setAuthType(value)
                    setAuthConfig({ ...authConfig, type: value })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select authentication type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Authentication</SelectItem>
                    <SelectItem value="basic">Basic Auth</SelectItem>
                    <SelectItem value="bearer">Bearer Token</SelectItem>
                    <SelectItem value="apiKey">API Key</SelectItem>
                  </SelectContent>
                </Select>

                {authType === 'basic' && (
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Username"
                      value={authConfig.username}
                      onChange={(e) => setAuthConfig({ ...authConfig, username: e.target.value })}
                    />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={authConfig.password}
                      onChange={(e) => setAuthConfig({ ...authConfig, password: e.target.value })}
                    />
                  </div>
                )}

                {authType === 'bearer' && (
                  <Input
                    type="text"
                    placeholder="Bearer Token"
                    value={authConfig.token}
                    onChange={(e) => setAuthConfig({ ...authConfig, token: e.target.value })}
                  />
                )}

                {authType === 'apiKey' && (
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="API Key"
                      value={authConfig.apiKey}
                      onChange={(e) => setAuthConfig({ ...authConfig, apiKey: e.target.value })}
                    />
                    <Input
                      type="text"
                      placeholder="Header Key (e.g., X-API-Key)"
                      value={authConfig.headerKey}
                      onChange={(e) => setAuthConfig({ ...authConfig, headerKey: e.target.value })}
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="inHeader"
                        checked={authConfig.inHeader}
                        onChange={(e) => setAuthConfig({ ...authConfig, inHeader: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="inHeader" className="text-sm">Send as header</label>
                    </div>
                  </div>
                )}
              </div>

              {apiUrl && walletAddress && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Complete URL:</label>
                  <Card className="bg-gray-50 dark:bg-gray-800">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <code className="text-xs flex-1 break-all">
                          {getCompleteUrl(apiUrl, walletAddress, authConfig)}
                        </code>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            navigator.clipboard.writeText(getCompleteUrl(apiUrl, walletAddress, authConfig));
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Testing...' : 'Test API'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {result && (
            <Tabs defaultValue="response" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="response" className="flex-1">API Response</TabsTrigger>
                <TabsTrigger value="verification" className="flex-1">Verification</TabsTrigger>
                {isExpressionValid && <TabsTrigger value="function" className="flex-1">Function</TabsTrigger>}
              </TabsList>

              <TabsContent value="response">
                <Card>
                  <CardHeader>
                    <CardTitle>API Response</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-[400px] text-sm">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="verification">
                <Card>
                  <CardHeader>
                    <CardTitle>Verification Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`p-4 rounded-lg ${result.isValid === 1
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
                      }`}>
                      <p className="font-medium">Status: {result.status}</p>
                      <p>Is Valid: {result.isValid}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {isExpressionValid && (
                <TabsContent value="function">
                  <Card>
                    <CardHeader>
                      <CardTitle>Copy this expression to use in task config</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto font-mono text-sm">
                          {getFunctionString()}
                        </pre>
                        <Button
                          onClick={() => navigator.clipboard.writeText(getFunctionString())}
                          variant="secondary"
                          className="absolute top-2 right-2"
                          size="sm"
                        >
                          Copy
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          )}
        </div>
      </div>
    </main>
  )
}
