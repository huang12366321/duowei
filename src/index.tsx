import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import {
  bitable,
  FieldType,
  ILocationField,
  ILocationFieldMeta, ITableMeta, ITextField, ITextFieldMeta
} from '@lark-base-open/js-sdk';
import getTable, {findClosestLocation} from './exchange-api'
import {  AlertProps, Button, Select } from 'antd';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <LoadApp/>
    </React.StrictMode>
)

function LoadApp() {
  const [info, setInfo] = useState('get table name, please waiting ....');
  const [alertType, setAlertType] = useState<AlertProps['type']>('info');



  const [tableMetaList, setTableMetaList] = useState<ITableMeta[]>([]);
  const [locationFieldMetaList, setMetaList] = useState<ILocationFieldMeta[]>([])
  const [textFieldMetaList, inputMetaList] = useState<ITextFieldMeta[]>([])


  const [tableId, setTableId] = useState<string>();
  const [selectFieldId, setSelectFieldId] = useState<string>();
  const [inputFieldId, setInputFieldId] = useState<string>();

  useEffect(() => {
    const fn = async () => {
      const table = await bitable.base.getActiveTable();
      const tableName = await table.getName();
      setInfo(`The table Name is ${tableName}`);
      setAlertType('success');
      const tableMetaList = await bitable.base.getTableMetaList();
      setTableMetaList(tableMetaList);


      const fieldMetaList = await table.getFieldMetaListByType<ILocationFieldMeta>(FieldType.Location );
      const fieldMetaList2 = await table.getFieldMetaListByType<ITextFieldMeta>(FieldType.Text );
      setMetaList(fieldMetaList);
      inputMetaList(fieldMetaList2);
    };
    fn();
  }, []);

  const tableFieldMetaList =(metaList: ITableMeta[]) => {
    return metaList.map(meta => ({ label: meta.name, value: meta.id }));
  };

  const formatFieldMetaList = (metaList: ILocationFieldMeta[]) => {
    return metaList.map(meta => ({ label: meta.name, value: meta.id }));
  };

  const inputFieldMetaList = (metaList: ITextFieldMeta[]) => {
    return metaList.map(meta => ({ label: meta.name, value: meta.id }));
  };

  const transform = async () => {
    if (!selectFieldId||! inputFieldId!||!tableId) return;
    const table = await bitable.base.getActiveTable();
    const jsonArray = await getTable(tableId);

    const currencyField = await table.getField<ILocationField>(selectFieldId);
    const inputField  = await  table.getField<ITextField>(inputFieldId)

    // const currentCurrency = await currencyField.getCurrencyCode();
    // await currencyField.setCurrencyCode(currency);
    // const ratio = await getExchangeRate(currentCurrency, currency);
    // if (!ratio) return;
    const recordIdList = await table.getRecordIdList();
    for (const recordId of recordIdList) {
      const currentVal = await currencyField.getValue(recordId);
      const currentVal2 = await inputField.getValue(recordId);

    if (!currentVal2){
      await inputField.setValue(recordId,findClosestLocation(currentVal.location,jsonArray));
    }


      // if (!currentVal2){
      //   await inputField.setValue(recordId, currentVal.name);
      // }
      // await currencyField.setValue(recordId, currentVal * ratio);
    }
  }

  return <div>
    <div style={{margin: 10}}>
      <div>选择数据源</div>
      <Select style={{width: 120}} onSelect={setTableId} options={tableFieldMetaList(tableMetaList)}/>

    </div>
    <div style={{margin: 10}}>
      <div>选择定位点</div>
      <Select style={{width: 120}} onSelect={setSelectFieldId} options={formatFieldMetaList(locationFieldMetaList)}/>
    </div>
    <div style={{margin: 10}}>
      <div>写入字段</div>
      <Select style={{width: 120}} onSelect={setInputFieldId} options={inputFieldMetaList(textFieldMetaList)}/>
      <Button style={{marginLeft: 10}} onClick={transform}>transform</Button>
    </div>
  </div>
}