/**
 * MainLayout - Layout wrapper component
 * Phase 3: Extracted from App.tsx for cleaner architecture
 */
import React, { type ReactNode } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import NetworkGraph from '../components/NetworkGraph/index'
import NodeModalWrapper from '../components/NodeModal/NodeModalWrapper'
import { useDashboard } from '../context'

interface MainLayoutProps {
    children?: ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = () => {
    const { selectedNode, selectedDesa, isLoading } = useDashboard()

    return (
        <div className="min-h-screen flex bg-gray-50 font-sans">

            {/* SIDEBAR */}
            <Sidebar />

            {/* MAIN CONTENT */}
            <main
                className={`flex-1 flex flex-col transition-all duration-300 ${selectedNode ? 'pr-96' : ''
                    }`}
            >
                <Header />

                {/* GRAPH */}
                <div className="flex-1 relative">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                                <p>Loading network data...</p>
                            </div>
                        </div>
                    ) : selectedDesa ? (
                        <NetworkGraph />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 animate-in fade-in">
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-md">
                                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-8 h-8 text-purple-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    No Location Selected
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Please select a{' '}
                                    <span className="text-purple-600 font-bold">Kabupaten</span>{' '}
                                    and{' '}
                                    <span className="text-purple-600 font-bold">Desa</span> from
                                    the sidebar to visualize the Trust Network.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* MODAL */}
                <NodeModalWrapper />
            </main>
        </div>
    )
}

export default MainLayout
