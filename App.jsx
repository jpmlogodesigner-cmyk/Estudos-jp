\
    import React, { useMemo, useState } from "react";
    import { motion } from "framer-motion";
    import { Calendar, CheckCircle, Clock, ListChecks, PlusCircle, Settings, TrendingUp } from "lucide-react";

    const DISCIPLINAS = [
      "Biologia",
      "Português",
      "Informática",
      "Criminalística",
      "Raciocínio Lógico",
      "Direito Processual Penal",
      "Direito Constitucional",
      "Direitos Humanos",
      "Direito Administrativo",
      "Direito Penal",
      "Medicina Legal",
      "Legislação Especial",
    ];

    function regrasDaDisciplina(disciplina) {
      if (disciplina === "Biologia") {
        return { revisao: 12, ex: [2, 7, 25] };
      }
      return { revisao: 15, ex: [3, 10, 20] };
    }

    const HORAS_PADRAO = {
      "Segunda-feira": 4,
      "Terça-feira": 5,
      "Quarta-feira": 4,
      "Quinta-feira": 5,
      "Sexta-feira": 3,
      "Sábado": 3,
      "Domingo": 2,
    };

    const fmt = (d) => d.toISOString().slice(0, 10);
    const addDays = (d, n) => {
      const x = new Date(d);
      x.setDate(x.getDate() + n);
      return x;
    };

    export default function App() {
      const [horas, setHoras] = useState(HORAS_PADRAO);
      const [ativas, setAtivas] = useState([
        "Biologia",
        "Português",
        "Criminalística",
        "Medicina Legal",
        "Raciocínio Lógico",
      ]);
      const [registro, setRegistro] = useState({
        disciplina: "Biologia",
        topico: "",
        subtopico: "",
        dataConclusao: fmt(new Date()),
        acerto: "",
      });
      const [concluidos, setConcluidos] = useState([]);

      const addRegistro = () => {
        if (!registro.topico || !registro.subtopico) return;
        const d = new Date(registro.dataConclusao);
        const regra = regrasDaDisciplina(registro.disciplina);
        const novo = {
          ...registro,
          revisao: fmt(addDays(d, regra.revisao)),
          ex1: fmt(addDays(d, regra.ex[0])),
          ex2: fmt(addDays(d, regra.ex[1])),
          ex3: fmt(addDays(d, regra.ex[2])),
          id: Date.now().toString(),
        };
        setConcluidos((prev) => [novo, ...prev]);
        setRegistro({ ...registro, topico: "", subtopico: "", acerto: "" });
      };

      const [dataAgenda, setDataAgenda] = useState(fmt(new Date()));
      const agendaSugerida = useMemo(() => {
        const dia = new Date(dataAgenda).toLocaleDateString("pt-BR", { weekday: "long" });
        const diaPT = dia.charAt(0).toUpperCase() + dia.slice(1);
        const mapDia = {
          segunda: "Segunda-feira",
          terça: "Terça-feira",
          terca: "Terça-feira",
          quarta: "Quarta-feira",
          quinta: "Quinta-feira",
          sexta: "Sexta-feira",
          sábado: "Sábado",
          sabado: "Sábado",
          domingo: "Domingo",
        };
        const diaKey = mapDia[dia.toLowerCase()] || diaPT;
        const horasDisponiveis = horas[diaKey] || 0;

        let minutosRestantes = horasDisponiveis * 60;
        const blocos = [];

        const ROT_MIN = 30;
        const ROT_MAX = 120;

        let idx = 0;
        while (minutosRestantes > 0 && ativas.length > 0) {
          const disciplina = ativas[idx % ativas.length];
          const dur = Math.min(ROT_MAX, Math.max(ROT_MIN, minutosRestantes >= 90 ? 60 : minutosRestantes));
          blocos.push({ disciplina, dur });
          minutosRestantes -= dur;
          idx++;
        }
        return { dia: diaKey, blocos };
      }, [dataAgenda, horas, ativas]);

      const pendencias = useMemo(() => {
        const itens = [];
        concluidos.forEach((c) => {
          [
            { tipo: "Revisão", data: c.revisao },
            { tipo: "Exercício", data: c.ex1 },
            { tipo: "Exercício", data: c.ex2 },
            { tipo: "Exercício", data: c.ex3 },
          ].forEach((t) => {
            itens.push({
              id: `${c.id}-${t.tipo}-${t.data}`,
              disciplina: c.disciplina,
              topico: c.topico,
              subtopico: c.subtopico,
              tipo: t.tipo,
              data: t.data,
            });
          });
        });
        return itens.sort((a, b) => a.data.localeCompare(b.data));
      }, [concluidos]);

      const Chip = ({ children }) => (
        <span className="px-2 py-1 rounded-full border text-xs">{children}</span>
      );

      return (
        <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">
          <div className="max-w-6xl mx-auto grid gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold">Painel de Estudos</h1>
                <p className="text-sm text-gray-600">Metodologia com metas diárias, exercícios e revisões automáticas</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Chip>Máx. 5 disciplinas ativas</Chip>
                <Chip>Blocos 30–120 min</Chip>
              </div>
            </div>

            <motion.div layout className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Settings className="w-5 h-5" />
                  <h2 className="text-lg font-medium">Horas por dia da semana</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.keys(horas).map((dia) => (
                    <label key={dia} className="flex items-center gap-2 text-sm border rounded-xl px-3 py-2">
                      <span className="w-28">{dia}</span>
                      <input
                        type="number"
                        min={0}
                        max={12}
                        className="w-20 border rounded px-2 py-1"
                        value={horas[dia]}
                        onChange={(e) => setHoras({ ...horas, [dia]: Number(e.target.value) })}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ListChecks className="w-5 h-5" />
                  <h2 className="text-lg font-medium">Ciclo de matérias (até 5)</h2>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {ativas.map((d) => (
                    <span key={d} className="px-3 py-1 rounded-full bg-gray-100 border text-sm">{d}</span>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {DISCIPLINAS.map((d) => {
                    const ativo = ativas.includes(d);
                    return (
                      <button
                        key={d}
                        onClick={() => {
                          if (ativo) setAtivas(ativas.filter((x) => x !== d));
                          else if (ativas.length < 5) setAtivas([...ativas, d]);
                        }}
                        className={`text-sm px-3 py-1 rounded-full border ${ativo ? "bg-black text-white" : "bg-white"}`}
                      >
                        {ativo ? "✓ " : ""}{d}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            <motion.div layout className="bg-white rounded-2xl shadow p-4">
              <div className="flex items-center gap-2 mb-4">
                <PlusCircle className="w-5 h-5" />
                <h2 className="text-lg font-medium">Registrar Estudo Primário Concluído</h2>
              </div>
              <div className="grid md:grid-cols-5 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Disciplina</label>
                  <select
                    className="w-full border rounded-xl px-3 py-2"
                    value={registro.disciplina}
                    onChange={(e) => setRegistro({ ...registro, disciplina: e.target.value })}
                  >
                    {DISCIPLINAS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Tópico</label>
                  <input
                    className="w-full border rounded-xl px-3 py-2"
                    placeholder="Ex.: 1.2 Estrutura do DNA/RNA"
                    value={registro.topico}
                    onChange={(e) => setRegistro({ ...registro, topico: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Subtópico</label>
                  <input
                    className="w-full border rounded-xl px-3 py-2"
                    placeholder="Ex.: 1.2.1 Replicação"
                    value={registro.subtopico}
                    onChange={(e) => setRegistro({ ...registro, subtopico: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Data de conclusão</label>
                  <input
                    type="date"
                    className="w-full border rounded-xl px-3 py-2"
                    value={registro.dataConclusao}
                    onChange={(e) => setRegistro({ ...registro, dataConclusao: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">% de acerto (opcional)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="w-full border rounded-xl px-3 py-2"
                    value={registro.acerto}
                    onChange={(e) => setRegistro({ ...registro, acerto: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button onClick={addRegistro} className="px-4 py-2 rounded-xl bg-black text-white">
                  Adicionar
                </button>
              </div>

              {concluidos.length > 0 && (
                <div className="mt-6 overflow-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2 pr-3">Disciplina</th>
                        <th className="py-2 pr-3">Tópico</th>
                        <th className="py-2 pr-3">Subtópico</th>
                        <th className="py-2 pr-3">Concluído</th>
                        <th className="py-2 pr-3">Revisão</th>
                        <th className="py-2 pr-3">Ex 1</th>
                        <th className="py-2 pr-3">Ex 2</th>
                        <th className="py-2 pr-3">Ex 3</th>
                      </tr>
                    </thead>
                    <tbody>
                      {concluidos.map((c) => (
                        <tr key={c.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 pr-3">{c.disciplina}</td>
                          <td className="py-2 pr-3">{c.topico}</td>
                          <td className="py-2 pr-3">{c.subtopico}</td>
                          <td className="py-2 pr-3">{c.dataConclusao}</td>
                          <td className="py-2 pr-3">{c.revisao}</td>
                          <td className="py-2 pr-3">{c.ex1}</td>
                          <td className="py-2 pr-3">{c.ex2}</td>
                          <td className="py-2 pr-3">{c.ex3}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>

            <motion.div layout className="bg-white rounded-2xl shadow p-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5" />
                <h2 className="text-lg font-medium">Agenda do Dia (sugestão por rotação)</h2>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="date"
                  className="border rounded-xl px-3 py-2"
                  value={dataAgenda}
                  onChange={(e) => setDataAgenda(e.target.value)}
                />
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" /> {agendaSugerida.dia}: {horas[agendaSugerida.dia] || 0} h disponíveis
                </div>
              </div>
              {agendaSugerida.blocos.length === 0 ? (
                <p className="text-sm text-gray-600">Sem horas disponíveis ou nenhuma disciplina ativa.</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {agendaSugerida.blocos.map((b, i) => (
                    <div key={i} className="rounded-xl border p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{b.disciplina}</div>
                        <div className="text-xs text-gray-500">Bloco {i + 1}</div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4" /> {b.dur} min
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div layout className="bg-white rounded-2xl shadow p-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5" />
                <h2 className="text-lg font-medium">Próximas pendências</h2>
              </div>
              {pendencias.length === 0 ? (
                <p className="text-sm text-gray-600">Sem pendências ainda. Conclua um estudo primário para gerar as próximas metas.</p>
              ) : (
                <div className="overflow-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2 pr-3">Data</th>
                        <th className="py-2 pr-3">Tipo</th>
                        <th className="py-2 pr-3">Disciplina</th>
                        <th className="py-2 pr-3">Tópico</th>
                        <th className="py-2 pr-3">Subtópico</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendencias.map((p) => (
                        <tr key={p.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 pr-3">{p.data}</td>
                          <td className="py-2 pr-3">{p.tipo}</td>
                          <td className="py-2 pr-3">{p.disciplina}</td>
                          <td className="py-2 pr-3">{p.topico}</td>
                          <td className="py-2 pr-3">{p.subtopico}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>

            <div className="text-xs text-gray-500 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5" />
              <p>
                Dica: quando seu desempenho (acertos) ficar ≥ 80% em uma disciplina, reserve aos sábados um bloco de 60–90 min para uma revisão geral ativa.
              </p>
            </div>
          </div>
        </div>
      );
    }
