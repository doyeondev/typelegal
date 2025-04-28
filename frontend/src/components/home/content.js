import Animation from './animation'
import Link from 'next/link'

export default function Content() {
  return (
    <>
      <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
        <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">
          CONAN
          <br className="lg:inline-block" />
          계약서 작성이 쉬워지다
        </h1>
        <p className="mb-8 leading-relaxed">계약서 작성부터 관리까지, 기업 운영에 필요한 단 하나의 법무시스템 (Coming Soon!)</p>
        <div className="flex justify-center">
          <Link href="/projects" className="btn-project">
            코난 시작하기
          </Link>
          {/* <button className="ml-4 inline-flex text-gray-700 bg-gray-100 border-0 py-2 px-6 focus:outline-none hover:bg-gray-200 rounded text-lg">Button</button> */}
        </div>
      </div>
      <div className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6">
        <Animation />
      </div>
    </>
  )
}
