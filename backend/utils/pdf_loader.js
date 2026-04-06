import ChatGoogleGenerativeAI from langchain_google_genai
import PromptTemplate from langchain_core.prompts
import StrOutputParser from langchain_core.output_parsers
import PyPDFLoader from langchain_community.document_loaders

import load_dotenv from dotenv
load_dotenv()

loader = PyPDFLoader("resume.pdf")
documents = loader.load()

prompt = PromptTemplate(
    input_variables = ["text"],
    template = "give the contact information from the following resume :  {text}",
)
model = ChatGoogleGenerativeAI(model = "gemini-2.5-flash")
output_parser = StrOutputParser()
chain = prompt | model | output_parser
result = chain.invoke({ "text": documents[0].page_content })
print(result)