'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { ArrowRight, Sparkles, Info, Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Exa from "exa-js"

const exa = new Exa("45aa7d91-e17e-4a8d-8ffa-5968cd31193a");

interface SearchResult {
  title: string;
  text: string;
  score: number;
  url: string;
  publishedDate: string;
  author?: string;
}

interface SearchResponse {
  results: SearchResult[];
}

export default function Component() {
    const [isFocused, setIsFocused] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('darkMode') === 'true'
        }
        return true
    })

    const [showAbout, setShowAbout] = useState(false);
    const [showContact, setShowContact] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [resultsPerPage] = useState(5);
    const [sortOption, setSortOption] = useState<'relevance' | 'date'>('relevance');

    const suggestions = useMemo(() => ['Explore the cosmos with LLM', 'What are neural networks?', 'Explain quantum computing in simple terms'], []);

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (isFocused) {
            timer = setTimeout(() => setShowSuggestions(true), 300)
        } else {
            setShowSuggestions(false)
        }
        return () => clearTimeout(timer)
    }, [isFocused])

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode)
        localStorage.setItem('darkMode', darkMode.toString())
    }, [darkMode])

    const handleSearch = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setShowSuggestions(false)
        setError(null)

        try {
            const result = await exa.searchAndContents(
                inputValue,
                {
                    type: "neural",
                    useAutoprompt: true,
                    numResults: 10,
                    text: true
                }
            )
            console.log("Exa API response:", result);
            setSearchResults(result as SearchResponse);
            setCurrentPage(1);
        } catch (error) {
            console.error('Error performing search:', error)
            setError('An error occurred while searching. Please try again.')
            setSearchResults(null)
        } finally {
            setIsLoading(false)
        }
    }, [inputValue])

    const toggleDarkMode = useCallback(() => {
        setDarkMode(prevMode => !prevMode);
    }, [])

    const indexOfLastResult = currentPage * resultsPerPage;
    const indexOfFirstResult = indexOfLastResult - resultsPerPage;
    const currentResults = searchResults ? searchResults.results.slice(indexOfFirstResult, indexOfLastResult) : [];

    const paginate = useCallback((pageNumber: number) => setCurrentPage(pageNumber), []);

    const sortResults = useCallback((option: 'relevance' | 'date') => {
        setSortOption(option);
        if (searchResults) {
            const sortedResults = [...searchResults.results];

            if (option === 'date') {
                sortedResults.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
            } else if (option === 'relevance') {
                sortedResults.sort((a, b) => b.score - a.score);
            }

            setSearchResults({ ...searchResults, results: sortedResults });
            setCurrentPage(1);
        }
    }, [searchResults])

    return (
        <div className={`min-h-screen flex flex-col items-center justify-between p-4 overflow-hidden ${darkMode ? 'bg-gradient-to-br from-gray-900 to-black' : 'bg-gradient-to-br from-blue-100 to-white'}`}>
            {/* Navbar */}
            <nav className="w-full max-w-5xl flex items-center justify-between mb-6 py-4">
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Aetheris Search</div>
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" className={`${darkMode ? 'text-white' : 'text-gray-800'} hover:text-blue-400 transition-colors`} onClick={() => setShowAbout(true)}>About</Button>
                    <Button variant="ghost" className={`${darkMode ? 'text-white' : 'text-gray-800'} hover:text-blue-400 transition-colors`} onClick={() => setShowContact(true)}>Contact</Button>
                    <Button variant="ghost" onClick={toggleDarkMode} className={`${darkMode ? 'text-white' : 'text-gray-800'} hover:text-blue-400 transition-colors`} aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
                        {darkMode ? <Sun size={24} /> : <Moon size={24} />}
                    </Button>
                </div>
            </nav>

            <div className="relative w-full max-w-md z-10 mb-8">
                <form onSubmit={handleSearch}>
                    <motion.div
                        initial={false}
                        animate={isFocused ? { boxShadow: "0 0 30px 5px rgba(59, 130, 246, 0.5), 0 0 10px 2px rgba(59, 130, 246, 0.3)" } : { boxShadow: "0 0 20px 2px rgba(59, 130, 246, 0.2)" }}
                        transition={{ duration: 0.3 }}
                        className={`relative rounded-full ${darkMode ? 'bg-gray-800' : 'bg-white'} bg-opacity-20 backdrop-blur-md overflow-hidden border border-blue-300 border-opacity-30`}
                    >
                        <Input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className={`w-full py-6 pl-28 pr-12 rounded-full bg-transparent focus:outline-none text-lg ${darkMode ? 'text-white placeholder-gray-400' : 'text-gray-800 placeholder-gray-500'}`}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setTimeout(() => setIsFocused(false), 100)}
                            placeholder="Search the Aetheris"
                        />
                        <motion.span
                            initial={false}
                            animate={isFocused ? { x: -4, opacity: 0.5 } : { x: 0, opacity: 1 }}
                            className={`absolute left-8 top-1/2 transform -translate-y-1/2 font-semibold text-lg ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}
                        >
                            aetheris
                        </motion.span>
                        <motion.button
                            type="submit"
                            initial={false}
                            animate={isFocused ? { x: 4, rotate: 0 } : { x: 0, rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            className={`absolute right-6 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}
                            aria-label="Search"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-400"></div>
                            ) : isFocused ? <ArrowRight size={24} /> : <Sparkles size={24} />}
                        </motion.button>
                    </motion.div>
                </form>
                <AnimatePresence>
                    {showSuggestions && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className={`absolute w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} bg-opacity-20 backdrop-blur-md mt-2 rounded-2xl overflow-hidden border border-blue-300 border-opacity-30`}
                        >
                            {suggestions.map((suggestion, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`px-6 py-3 hover:bg-blue-400 hover:bg-opacity-20 cursor-pointer ${darkMode ? 'text-white' : 'text-gray-800'}`}
                                    onClick={() => setInputValue(suggestion)}
                                >
                                    {suggestion}
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* LLM Badge */}
            <div className={`${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
                <span className="bg-blue-500 text-white py-1 px-3 rounded-full text-sm font-semibold">An LLM based search engine</span>
            </div>

            {/* Search Results */}
            <div className={`w-full max-w-4xl ${darkMode ? 'bg-gray-800' : 'bg-white'} bg-opacity-20 backdrop-blur-md rounded-2xl p-6 shadow-lg`}>
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400"></div>
                    </div>
                ) : searchResults ? (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <div className={`text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                Sorted by: <span className="font-semibold">{sortOption}</span>
                            </div>
                            <div className="flex space-x-2">
                                <Button 
                                    onClick={() => sortResults('date')} 
                                    variant={sortOption === 'date' ? "default" : "outline"} 
                                    size="sm"
                                >
                                    Date
                                </Button>
                                <Button 
                                    onClick={() => sortResults('relevance')} 
                                    variant={sortOption === 'relevance' ? "default" : "outline"} 
                                    size="sm"
                                >
                                    Relevance
                                </Button>
                            </div>
                        </div>
                        {currentResults.map((result, index) => (
                            <div key={index} className={`mb-6 last:mb-0 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                <h3 className="text-xl font-semibold mb-2">{result.title}</h3>
                                <p className="text-sm opacity-80 mb-2">{result.text.slice(0, 200)}...</p>
                                <div className="text-xs opacity-60">
                                    <p>Score: {result.score.toFixed(4)}</p>
                                    <p>URL: <a href={result.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-400 transition-colors">{result.url}</a></p>
                                    <p>Published: {new Date(result.publishedDate).toLocaleDateString()}</p>
                                    {result.author && <p>Author: {result.author}</p>}
                                </div>
                                {/* LLM Insights */}
                                <div className={`mt-2 p-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} bg-opacity-50 rounded-lg`}>
                                    <Info size={16} className="inline-block mr-2" />
                                    <span className="text-sm opacity-70">This result was generated by understanding the semantic meaning of your query, not just keyword matching.</span>
                                </div>
                            </div>
                        ))}

                        {/* Pagination */}
                        <div className="flex justify-center mt-6">
                            {Array.from({length: Math.ceil((searchResults?.results.length || 0) / resultsPerPage)}).map((_, i) => (
                                <Button
                                    key={i}
                                    onClick={() => paginate(i + 1)}
                                    variant={currentPage === i + 1 ? "default" : "outline"}
                                    size="sm"
                                    className="mx-1"
                                >
                                    {i + 1}
                                </Button>
                            ))}
                        </div>
                    </>
                ) : error ? (
                    <div className="text-red-400 py-20 text-center">{error}</div>
                ) : (
                    <div className={`${darkMode ? 'text-white' : 'text-gray-800'} py-20 text-center`}>No results found. Try a different search query.</div>
                )}
            </div>

            {/* About & Contact Modals */}
            <AnimatePresence>
                {showAbout && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => setShowAbout(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            transition={{ duration: 0.3 }}
                            className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} bg-opacity-90 rounded-lg p-8 text-center max-w-md w-full shadow-xl`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-semibold mb-4">About Aetheris Search</h2>
                            <p className="mb-4">
                                Aetheris Search is an advanced, cutting-edge search engine powered by
                                <strong> Large Language Models (LLMs)</strong>. Unlike traditional search engines
                                that rely heavily on matching exact keywords, Aetheris understands the
                                <strong> context</strong> and <strong>meaning</strong> behind your search terms,
                                allowing it to provide more relevant and insightful results.
                            </p>
                            <p className="mb-4">
                                With Aetheris Search, you're not just searching with keywords—you're exploring the
                                vast cosmos of information with the help of advanced AI!
                            </p>
                            <Button onClick={() => setShowAbout(false)}>
                                Close
                            </Button>
                        </motion.div>
                    </motion.div>
                )}

                {showContact && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => setShowContact(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            transition={{ duration: 0.3 }}
                            className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} bg-opacity-90 rounded-lg p-8 text-center max-w-md w-full shadow-xl`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                            <p className="mb-4">Feel free to reach out to us at <strong>singhanubhav7456@gmail.com</strong> or call us at <strong>+91 7088963373</strong>.</p>
                            <Button onClick={() => setShowContact(false)}>Close</Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <footer className={`w-full max-w-5xl flex items-center justify-between py-4 mt-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                <p className="text-xs">&copy; 2024 Aetheris Search. All rights reserved.</p>
                <div className="text-xs">Made by Anubhav</div>
            </footer>

            {/* Background Animation */}
            {Array.from({length: 50}).map((_, i) => (
                <motion.div
                    key={i}
                    className={`absolute w-1 h-1 ${darkMode ? 'bg-blue-400' : 'bg-blue-600'} rounded-full`}
                    animate={{
                        x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
                        y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0],
                    }}
                    transition={{
                        duration: Math.random() * 10 + 20,
                        repeat: Infinity,
                        repeatType: "loop",
                    }}
                />
            ))}
        </div>
    )
}