import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head'
import Link from 'next/link'

function App() {


  const projectId = process.env.REACT_APP_PROJECT_ID;
  const projectSecretKey = process.env.REACT_APP_PROJECT_KEY;
  const authorization = "Basic " + projectId + ":" + projectSecretKey;
  // path="protocol" element={<Protocol provider={provider} setProvider={setProvider} />} />
  // path="pool" element={<h2>Pool</h2>} />
  // path="deploy" element={<DeployPool provider={provider} setProvider={setProvider} />} />
  // path="treasury" element={<h2>Treasury</h2>} />
  // path="send" element={<Send />} />
  return (
    <div className="App">
      <header className="App-header">
        <h1>PIVOT FINANCE</h1>
        <nav className="border-b p-6">
          <div className="flex mt-4">
            <Link href="/">
              <a className="mr-4 text-pink-500">
                Home
              </a>
            </Link>
            <Link href="/protocol">
              <a className="mr-6 text-pink-500">
                Protocol
              </a>
            </Link>
            <Link href="/pool">
              <a className="mr-6 text-pink-500">
                Pool
              </a>
            </Link>
            <Link href="/deploy">
              <a className="mr-6 text-pink-500">
                Deploy Pool
              </a>
            </Link>
            <Link href="/treasury">
              <a className="mr-6 text-pink-500">
                Treasury
              </a>
            </Link>
          </div>
        </nav>
      </header>
    </div>
  );
}

export default App;
