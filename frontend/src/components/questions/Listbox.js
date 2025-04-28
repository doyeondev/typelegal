import React, { useState, useEffect } from 'react'
import { Listbox, Transition } from '@headlessui/react'

export default function ListElem({ dataList, onChange }) {
  const [optionValue, setOptionValue] = useState(dataList.placeholder)
  // console.log('dataList', dataList)
  let selectedOption
  if (dataList.value) {
    selectedOption = dataList.options.filter(x => x.value === dataList.value)
  }
  // useEffect(() => {
  //   console.log('optionValue UPDATED : ', optionValue)
  // }, [optionValue])

  return (
    <div className="flex items-center justify-center z-100">
      <div className="w-full mx-auto">
        <Listbox as="div" className="space-y-1" value={optionValue} onChange={setOptionValue}>
          {({ open }) => (
            <>
              <div className="relative">
                <span className="inline-block w-full rounded-md shadow-sm">
                  <Listbox.Button
                    name={dataList.binding_key}
                    className="cursor-default relative w-full rounded-sm border border-gray-300 bg-white pl-3 pr-10 py-2.5 text-left focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition ease-in-out duration-150 sm:text-sm sm:leading-5"
                  >
                    <span className="block truncate text-gray-600">{selectedOption ? selectedOption[0].label : optionValue}</span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                        <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </Listbox.Button>
                </span>
                <Transition show={open} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0" className="absolute mt-1 w-full rounded-md bg-white shadow-lg block">
                  <Listbox.Options static className="max-h-60 rounded-md py-1 text-base leading-6 shadow-xs overflow-auto focus:outline-none sm:text-sm sm:leading-5">
                    {dataList.options.map((option, index) => (
                      <Listbox.Option key={option.value} value={option.label} onClick={event => onChange(event)}>
                        {({ selected, active }) => (
                          <div
                            id={dataList._id}
                            index={index} // 지워야함
                            name={index}
                            className={`${active ? 'text-white bg-blue-600' : 'text-gray-900 bg-white'} cursor-default select-none relative py-2 pl-8 pr-4 z-20 hover:text-white hover:bg-blue-600`}
                          >
                            <span className={`${selected ? 'font-semibold' : 'font-normal'} w-full block truncate z-0 pointer-events-none	`}>{option.label}</span>
                            {selected && (
                              <span className={`${active ? 'text-white' : 'text-blue-600'} absolute inset-y-0 left-0 flex items-center pl-1.5`}>
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                          </div>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </>
          )}
        </Listbox>
      </div>
    </div>
  )
}
