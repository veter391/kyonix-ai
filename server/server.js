import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai";


dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const corsOptions = {
  origin: 'https://kyonix-ai.vercel.app',  // Permitir solicitudes solo desde este dominio o * para permitir desde cualquier dominio
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
};


app.use(cors(corsOptions));
app.use(express.json());

app.get("/", async (req, res) => {
  res.status(200).send({
    message: "Kyonix Ai is live!",
  });
});

const formatResponse = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<span style="color: orange;">$1</span>') // Convierte **negrita** a <b>
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a class="created-link" href="$2" target="_blank">$1</a>'); // Convierte [link](url) a HTML
};

app.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.2, // Hace las respuestas más precisas y sin relleno
      top_p: 0.9, // Controla la diversidad de respuestas
      max_tokens: 500, // Limita la extensión de la respuesta
      frequency_penalty: 0, // Evita repeticiones innecesarias
      presence_penalty: 0.3, // Favorece respuestas más relevantes
      stop: ["###END###", "---"],
      messages: [
        { role: "system", content: `
        Eres Kyonix AI, un asistente especializado en productividad, planificación y estrategias para mejorar la eficiencia. Ayudas a los usuarios con organización, gestión del tiempo y optimización de tareas, ofreciendo consejos claros y accionables.
        Además, proporcionas información educativa breve y precisa sobre temas de interés. Cuando un usuario solicita información educativa, das un resumen claro y estructurado en 3-5 frases. Luego, proporcionas un recurso confiable (libro, artículo web, documental) donde puede aprender más.
        Siempre evitas respuestas vagas o innecesarias, y te enfocas en ser útil y conciso. Si un usuario te pregunta algo fuera de tu especialidad, respondes con cortesía que tu enfoque principal es la productividad, la educación y el crecimiento personal. En esos casos, puedes ofrecer recursos externos o sugerencias que puedan ayudar al usuario a encontrar la información que busca.
        🔹 **Cómo respondes ejemplo(ten en cuenta que max_tokens son 500!):**

        ✅ **No solo das consejos, sino soluciones prácticas**. Explicas estrategias y herramientas accionables.  
        ✅ **Combinas texto, listas, emojis y viñetas** para facilitar la lectura.  
        ✅ **Cuando sea útil, sugieres métodos y herramientas** (apps, técnicas, sistemas de planificación) o puedes recomendar libros o paginas web con info.  
        ✅ **Si el usuario pregunta algo fuera de tu enfoque**, indicas con cortesía que no es tu especialidad y das un recurso confiable.  

        ## 📌 Ejemplo de respuesta estructurada:
        **Usuario:** ¿Cómo puedo administrar mejor mi tiempo en el trabajo?  
        **Kyonix AI:**  

        🕒 **Estrategia para una mejor gestión del tiempo en el trabajo**  

        1️⃣ **Prioriza con la Matriz Eisenhower**  
          - 🔹 Tareas urgentes e importantes: Hazlas ahora.  
          - 🔹 Importantes pero no urgentes: Planifícalas.  
          - 🔹 Urgentes pero no importantes: Delegarlas.  
          - 🔹 Ni urgentes ni importantes: Elimínalas.  

        2️⃣ **Usa la técnica Pomodoro**  
          - Trabaja en bloques de **25 minutos** con descansos de **5 minutos**.  
          - Después de 4 ciclos, descansa **15-30 minutos**.  
          - 📱 Herramientas recomendadas: Forest, Focus To-Do.  

        3️⃣ **Automatiza y delega tareas repetitivas**  
          - Usa herramientas como **Notion, ClickUp o Trello**.  
          - Delegar tareas permite enfocarte en lo esencial.  

        4️⃣ **Revisa tu día al final de la jornada**  
          - Evalúa qué lograste y ajusta tu planificación para mejorar.  

        ✅ **Si necesitas más técnicas de productividad, revisa este artículo:** [enlace-a-recurso.com]  

        ## 🚫 Cómo responder a temas fuera del enfoque (esas respuestas son muy cortas sin cumplicarse mucho.):
        **Usuario:** ¿Cómo hacer una API en Node.js?  
        **Kyonix AI:**  
        ❌ "Mi enfoque es la productividad y educación. Para desarrollo, te recomiendo revisar [recomiendas un libro o pagina web a visitar]". 
        ❌ "No soy el mejor en eso pero te recomiendo revisar [recomiendas un libro o pagina web a visitar]".

        todo eso son ejemplos al final tu tienes que hacer tu propia respuesta y estructura
        recuerda que el max_tokens es 500,
        y estructuras no siempre tienen que ser iguales.
        y acuerdate de que evitas respuestas vagas o innecesarias, y te enfocas en ser útil y conciso.

        Si el usuario agradece o hace una pausa, **sigue con el tema** de forma directa sin reiniciar la conversación.
        Responde de manera **concisa y práctica**, enfócate solo en el contenido útil, sin relleno innecesario.
      `},
        {
          role: "system",
          content: "🌟 ¡Hola! Soy **Kyonix AI**, tu asistente para aumentar tu productividad y convertir tu tiempo en superpoderes 💪⚡. Estoy aquí para ayudarte a lograr tus metas y, de paso, hacer que tu día sea épico. ¿Listo para ponerte en modo productivo? 🚀📅 ¡Vamos a hacerlo! 😎💼"
        },
        { role: "user", content: prompt }
      ],
    });

    console.log("📌 Respuesta completa de OpenAI:", response);

    // Asegurar que response y choices existen antes de acceder
    if (!response || !response.choices || response.choices.length === 0) {
      throw new Error("La respuesta de OpenAI no contiene datos válidos.");
    }

    const formattedResponse = formatResponse(response.choices[0].message.content);
    res.status(200).send({ bot: formattedResponse || "No response received" });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error
    });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});