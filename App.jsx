import { useState } from "react";

export default function App() {
  const [disciplinas] = useState([
    "Genética Forense",
    "Biologia Molecular",
    "Direito Penal",
    "Medicina Legal",
    "Criminalística"
  ]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <h1 className="text-4xl font-bold text-white mb-6">📚 Painel de Estudos</h1>
      <ul className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-3">
        {disciplinas.map((d, i) => (
          <li key={i} className="p-3 bg-gray-100 rounded-xl hover:bg-indigo-100 transition">
            {d}
          </li>
        ))}
      </ul>
    </div>
  );
}