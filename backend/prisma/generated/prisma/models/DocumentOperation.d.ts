import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model DocumentOperation
 *
 */
export type DocumentOperationModel = runtime.Types.Result.DefaultSelection<Prisma.$DocumentOperationPayload>;
export type AggregateDocumentOperation = {
    _count: DocumentOperationCountAggregateOutputType | null;
    _avg: DocumentOperationAvgAggregateOutputType | null;
    _sum: DocumentOperationSumAggregateOutputType | null;
    _min: DocumentOperationMinAggregateOutputType | null;
    _max: DocumentOperationMaxAggregateOutputType | null;
};
export type DocumentOperationAvgAggregateOutputType = {
    lamportTs: number | null;
};
export type DocumentOperationSumAggregateOutputType = {
    lamportTs: bigint | null;
};
export type DocumentOperationMinAggregateOutputType = {
    id: string | null;
    documentId: string | null;
    userId: string | null;
    operationId: string | null;
    operationType: string | null;
    payload: runtime.Bytes | null;
    lamportTs: bigint | null;
    clientId: string | null;
    createdAt: Date | null;
};
export type DocumentOperationMaxAggregateOutputType = {
    id: string | null;
    documentId: string | null;
    userId: string | null;
    operationId: string | null;
    operationType: string | null;
    payload: runtime.Bytes | null;
    lamportTs: bigint | null;
    clientId: string | null;
    createdAt: Date | null;
};
export type DocumentOperationCountAggregateOutputType = {
    id: number;
    documentId: number;
    userId: number;
    operationId: number;
    operationType: number;
    payload: number;
    vectorClock: number;
    lamportTs: number;
    clientId: number;
    createdAt: number;
    _all: number;
};
export type DocumentOperationAvgAggregateInputType = {
    lamportTs?: true;
};
export type DocumentOperationSumAggregateInputType = {
    lamportTs?: true;
};
export type DocumentOperationMinAggregateInputType = {
    id?: true;
    documentId?: true;
    userId?: true;
    operationId?: true;
    operationType?: true;
    payload?: true;
    lamportTs?: true;
    clientId?: true;
    createdAt?: true;
};
export type DocumentOperationMaxAggregateInputType = {
    id?: true;
    documentId?: true;
    userId?: true;
    operationId?: true;
    operationType?: true;
    payload?: true;
    lamportTs?: true;
    clientId?: true;
    createdAt?: true;
};
export type DocumentOperationCountAggregateInputType = {
    id?: true;
    documentId?: true;
    userId?: true;
    operationId?: true;
    operationType?: true;
    payload?: true;
    vectorClock?: true;
    lamportTs?: true;
    clientId?: true;
    createdAt?: true;
    _all?: true;
};
export type DocumentOperationAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which DocumentOperation to aggregate.
     */
    where?: Prisma.DocumentOperationWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DocumentOperations to fetch.
     */
    orderBy?: Prisma.DocumentOperationOrderByWithRelationInput | Prisma.DocumentOperationOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.DocumentOperationWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DocumentOperations from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DocumentOperations.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned DocumentOperations
    **/
    _count?: true | DocumentOperationCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: DocumentOperationAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: DocumentOperationSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: DocumentOperationMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: DocumentOperationMaxAggregateInputType;
};
export type GetDocumentOperationAggregateType<T extends DocumentOperationAggregateArgs> = {
    [P in keyof T & keyof AggregateDocumentOperation]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateDocumentOperation[P]> : Prisma.GetScalarType<T[P], AggregateDocumentOperation[P]>;
};
export type DocumentOperationGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DocumentOperationWhereInput;
    orderBy?: Prisma.DocumentOperationOrderByWithAggregationInput | Prisma.DocumentOperationOrderByWithAggregationInput[];
    by: Prisma.DocumentOperationScalarFieldEnum[] | Prisma.DocumentOperationScalarFieldEnum;
    having?: Prisma.DocumentOperationScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: DocumentOperationCountAggregateInputType | true;
    _avg?: DocumentOperationAvgAggregateInputType;
    _sum?: DocumentOperationSumAggregateInputType;
    _min?: DocumentOperationMinAggregateInputType;
    _max?: DocumentOperationMaxAggregateInputType;
};
export type DocumentOperationGroupByOutputType = {
    id: string;
    documentId: string;
    userId: string;
    operationId: string;
    operationType: string;
    payload: runtime.Bytes;
    vectorClock: runtime.JsonValue | null;
    lamportTs: bigint;
    clientId: string | null;
    createdAt: Date;
    _count: DocumentOperationCountAggregateOutputType | null;
    _avg: DocumentOperationAvgAggregateOutputType | null;
    _sum: DocumentOperationSumAggregateOutputType | null;
    _min: DocumentOperationMinAggregateOutputType | null;
    _max: DocumentOperationMaxAggregateOutputType | null;
};
export type GetDocumentOperationGroupByPayload<T extends DocumentOperationGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<DocumentOperationGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof DocumentOperationGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], DocumentOperationGroupByOutputType[P]> : Prisma.GetScalarType<T[P], DocumentOperationGroupByOutputType[P]>;
}>>;
export type DocumentOperationWhereInput = {
    AND?: Prisma.DocumentOperationWhereInput | Prisma.DocumentOperationWhereInput[];
    OR?: Prisma.DocumentOperationWhereInput[];
    NOT?: Prisma.DocumentOperationWhereInput | Prisma.DocumentOperationWhereInput[];
    id?: Prisma.StringFilter<"DocumentOperation"> | string;
    documentId?: Prisma.StringFilter<"DocumentOperation"> | string;
    userId?: Prisma.StringFilter<"DocumentOperation"> | string;
    operationId?: Prisma.StringFilter<"DocumentOperation"> | string;
    operationType?: Prisma.StringFilter<"DocumentOperation"> | string;
    payload?: Prisma.BytesFilter<"DocumentOperation"> | runtime.Bytes;
    vectorClock?: Prisma.JsonNullableFilter<"DocumentOperation">;
    lamportTs?: Prisma.BigIntFilter<"DocumentOperation"> | bigint | number;
    clientId?: Prisma.StringNullableFilter<"DocumentOperation"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"DocumentOperation"> | Date | string;
    document?: Prisma.XOR<Prisma.DocumentScalarRelationFilter, Prisma.DocumentWhereInput>;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
};
export type DocumentOperationOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    documentId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    operationId?: Prisma.SortOrder;
    operationType?: Prisma.SortOrder;
    payload?: Prisma.SortOrder;
    vectorClock?: Prisma.SortOrderInput | Prisma.SortOrder;
    lamportTs?: Prisma.SortOrder;
    clientId?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    document?: Prisma.DocumentOrderByWithRelationInput;
    user?: Prisma.UserOrderByWithRelationInput;
};
export type DocumentOperationWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.DocumentOperationWhereInput | Prisma.DocumentOperationWhereInput[];
    OR?: Prisma.DocumentOperationWhereInput[];
    NOT?: Prisma.DocumentOperationWhereInput | Prisma.DocumentOperationWhereInput[];
    documentId?: Prisma.StringFilter<"DocumentOperation"> | string;
    userId?: Prisma.StringFilter<"DocumentOperation"> | string;
    operationId?: Prisma.StringFilter<"DocumentOperation"> | string;
    operationType?: Prisma.StringFilter<"DocumentOperation"> | string;
    payload?: Prisma.BytesFilter<"DocumentOperation"> | runtime.Bytes;
    vectorClock?: Prisma.JsonNullableFilter<"DocumentOperation">;
    lamportTs?: Prisma.BigIntFilter<"DocumentOperation"> | bigint | number;
    clientId?: Prisma.StringNullableFilter<"DocumentOperation"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"DocumentOperation"> | Date | string;
    document?: Prisma.XOR<Prisma.DocumentScalarRelationFilter, Prisma.DocumentWhereInput>;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
}, "id">;
export type DocumentOperationOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    documentId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    operationId?: Prisma.SortOrder;
    operationType?: Prisma.SortOrder;
    payload?: Prisma.SortOrder;
    vectorClock?: Prisma.SortOrderInput | Prisma.SortOrder;
    lamportTs?: Prisma.SortOrder;
    clientId?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.DocumentOperationCountOrderByAggregateInput;
    _avg?: Prisma.DocumentOperationAvgOrderByAggregateInput;
    _max?: Prisma.DocumentOperationMaxOrderByAggregateInput;
    _min?: Prisma.DocumentOperationMinOrderByAggregateInput;
    _sum?: Prisma.DocumentOperationSumOrderByAggregateInput;
};
export type DocumentOperationScalarWhereWithAggregatesInput = {
    AND?: Prisma.DocumentOperationScalarWhereWithAggregatesInput | Prisma.DocumentOperationScalarWhereWithAggregatesInput[];
    OR?: Prisma.DocumentOperationScalarWhereWithAggregatesInput[];
    NOT?: Prisma.DocumentOperationScalarWhereWithAggregatesInput | Prisma.DocumentOperationScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"DocumentOperation"> | string;
    documentId?: Prisma.StringWithAggregatesFilter<"DocumentOperation"> | string;
    userId?: Prisma.StringWithAggregatesFilter<"DocumentOperation"> | string;
    operationId?: Prisma.StringWithAggregatesFilter<"DocumentOperation"> | string;
    operationType?: Prisma.StringWithAggregatesFilter<"DocumentOperation"> | string;
    payload?: Prisma.BytesWithAggregatesFilter<"DocumentOperation"> | runtime.Bytes;
    vectorClock?: Prisma.JsonNullableWithAggregatesFilter<"DocumentOperation">;
    lamportTs?: Prisma.BigIntWithAggregatesFilter<"DocumentOperation"> | bigint | number;
    clientId?: Prisma.StringNullableWithAggregatesFilter<"DocumentOperation"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"DocumentOperation"> | Date | string;
};
export type DocumentOperationCreateInput = {
    id?: string;
    operationId: string;
    operationType: string;
    payload: runtime.Bytes;
    vectorClock?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    lamportTs?: bigint | number;
    clientId?: string | null;
    createdAt?: Date | string;
    document: Prisma.DocumentCreateNestedOneWithoutOperationsInput;
    user: Prisma.UserCreateNestedOneWithoutOperationsInput;
};
export type DocumentOperationUncheckedCreateInput = {
    id?: string;
    documentId: string;
    userId: string;
    operationId: string;
    operationType: string;
    payload: runtime.Bytes;
    vectorClock?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    lamportTs?: bigint | number;
    clientId?: string | null;
    createdAt?: Date | string;
};
export type DocumentOperationUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    operationId?: Prisma.StringFieldUpdateOperationsInput | string;
    operationType?: Prisma.StringFieldUpdateOperationsInput | string;
    payload?: Prisma.BytesFieldUpdateOperationsInput | runtime.Bytes;
    vectorClock?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    lamportTs?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clientId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    document?: Prisma.DocumentUpdateOneRequiredWithoutOperationsNestedInput;
    user?: Prisma.UserUpdateOneRequiredWithoutOperationsNestedInput;
};
export type DocumentOperationUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    documentId?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    operationId?: Prisma.StringFieldUpdateOperationsInput | string;
    operationType?: Prisma.StringFieldUpdateOperationsInput | string;
    payload?: Prisma.BytesFieldUpdateOperationsInput | runtime.Bytes;
    vectorClock?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    lamportTs?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clientId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DocumentOperationCreateManyInput = {
    id?: string;
    documentId: string;
    userId: string;
    operationId: string;
    operationType: string;
    payload: runtime.Bytes;
    vectorClock?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    lamportTs?: bigint | number;
    clientId?: string | null;
    createdAt?: Date | string;
};
export type DocumentOperationUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    operationId?: Prisma.StringFieldUpdateOperationsInput | string;
    operationType?: Prisma.StringFieldUpdateOperationsInput | string;
    payload?: Prisma.BytesFieldUpdateOperationsInput | runtime.Bytes;
    vectorClock?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    lamportTs?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clientId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DocumentOperationUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    documentId?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    operationId?: Prisma.StringFieldUpdateOperationsInput | string;
    operationType?: Prisma.StringFieldUpdateOperationsInput | string;
    payload?: Prisma.BytesFieldUpdateOperationsInput | runtime.Bytes;
    vectorClock?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    lamportTs?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clientId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DocumentOperationListRelationFilter = {
    every?: Prisma.DocumentOperationWhereInput;
    some?: Prisma.DocumentOperationWhereInput;
    none?: Prisma.DocumentOperationWhereInput;
};
export type DocumentOperationOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type DocumentOperationCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    documentId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    operationId?: Prisma.SortOrder;
    operationType?: Prisma.SortOrder;
    payload?: Prisma.SortOrder;
    vectorClock?: Prisma.SortOrder;
    lamportTs?: Prisma.SortOrder;
    clientId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type DocumentOperationAvgOrderByAggregateInput = {
    lamportTs?: Prisma.SortOrder;
};
export type DocumentOperationMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    documentId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    operationId?: Prisma.SortOrder;
    operationType?: Prisma.SortOrder;
    payload?: Prisma.SortOrder;
    lamportTs?: Prisma.SortOrder;
    clientId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type DocumentOperationMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    documentId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    operationId?: Prisma.SortOrder;
    operationType?: Prisma.SortOrder;
    payload?: Prisma.SortOrder;
    lamportTs?: Prisma.SortOrder;
    clientId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type DocumentOperationSumOrderByAggregateInput = {
    lamportTs?: Prisma.SortOrder;
};
export type DocumentOperationCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.DocumentOperationCreateWithoutUserInput, Prisma.DocumentOperationUncheckedCreateWithoutUserInput> | Prisma.DocumentOperationCreateWithoutUserInput[] | Prisma.DocumentOperationUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.DocumentOperationCreateOrConnectWithoutUserInput | Prisma.DocumentOperationCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.DocumentOperationCreateManyUserInputEnvelope;
    connect?: Prisma.DocumentOperationWhereUniqueInput | Prisma.DocumentOperationWhereUniqueInput[];
};
export type DocumentOperationUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.DocumentOperationCreateWithoutUserInput, Prisma.DocumentOperationUncheckedCreateWithoutUserInput> | Prisma.DocumentOperationCreateWithoutUserInput[] | Prisma.DocumentOperationUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.DocumentOperationCreateOrConnectWithoutUserInput | Prisma.DocumentOperationCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.DocumentOperationCreateManyUserInputEnvelope;
    connect?: Prisma.DocumentOperationWhereUniqueInput | Prisma.DocumentOperationWhereUniqueInput[];
};
export type DocumentOperationUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.DocumentOperationCreateWithoutUserInput, Prisma.DocumentOperationUncheckedCreateWithoutUserInput> | Prisma.DocumentOperationCreateWithoutUserInput[] | Prisma.DocumentOperationUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.DocumentOperationCreateOrConnectWithoutUserInput | Prisma.DocumentOperationCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.DocumentOperationUpsertWithWhereUniqueWithoutUserInput | Prisma.DocumentOperationUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.DocumentOperationCreateManyUserInputEnvelope;
    set?: Prisma.DocumentOperationWhereUniqueInput | Prisma.DocumentOperationWhereUniqueInput[];
    disconnect?: Prisma.DocumentOperationWhereUniqueInput | Prisma.DocumentOperationWhereUniqueInput[];
    delete?: Prisma.DocumentOperationWhereUniqueInput | Prisma.DocumentOperationWhereUniqueInput[];
    connect?: Prisma.DocumentOperationWhereUniqueInput | Prisma.DocumentOperationWhereUniqueInput[];
    update?: Prisma.DocumentOperationUpdateWithWhereUniqueWithoutUserInput | Prisma.DocumentOperationUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.DocumentOperationUpdateManyWithWhereWithoutUserInput | Prisma.DocumentOperationUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.DocumentOperationScalarWhereInput | Prisma.DocumentOperationScalarWhereInput[];
};
export type DocumentOperationUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.DocumentOperationCreateWithoutUserInput, Prisma.DocumentOperationUncheckedCreateWithoutUserInput> | Prisma.DocumentOperationCreateWithoutUserInput[] | Prisma.DocumentOperationUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.DocumentOperationCreateOrConnectWithoutUserInput | Prisma.DocumentOperationCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.DocumentOperationUpsertWithWhereUniqueWithoutUserInput | Prisma.DocumentOperationUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.DocumentOperationCreateManyUserInputEnvelope;
    set?: Prisma.DocumentOperationWhereUniqueInput | Prisma.DocumentOperationWhereUniqueInput[];
    disconnect?: Prisma.DocumentOperationWhereUniqueInput | Prisma.DocumentOperationWhereUniqueInput[];
    delete?: Prisma.DocumentOperationWhereUniqueInput | Prisma.DocumentOperationWhereUniqueInput[];
    connect?: Prisma.DocumentOperationWhereUniqueInput | Prisma.DocumentOperationWhereUniqueInput[];
    update?: Prisma.DocumentOperationUpdateWithWhereUniqueWithoutUserInput | Prisma.DocumentOperationUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.DocumentOperationUpdateManyWithWhereWithoutUserInput | Prisma.DocumentOperationUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.DocumentOperationScalarWhereInput | Prisma.DocumentOperationScalarWhereInput[];
};
export type DocumentOperationCreateNestedManyWithoutDocumentInput = {
    create?: Prisma.XOR<Prisma.DocumentOperationCreateWithoutDocumentInput, Prisma.DocumentOperationUncheckedCreateWithoutDocumentInput> | Prisma.DocumentOperationCreateWithoutDocumentInput[] | Prisma.DocumentOperationUncheckedCreateWithoutDocumentInput[];
    connectOrCreate?: Prisma.DocumentOperationCreateOrConnectWithoutDocumentInput | Prisma.DocumentOperationCreateOrConnectWithoutDocumentInput[];
    createMany?: Prisma.DocumentOperationCreateManyDocumentInputEnvelope;
    connect?: Prisma.DocumentOperationWhereUniqueInput | Prisma.DocumentOperationWhereUniqueInput[];
};
export type DocumentOperationUncheckedCreateNestedManyWithoutDocumentInput = {
    create?: Prisma.XOR<Prisma.DocumentOperationCreateWithoutDocumentInput, Prisma.DocumentOperationUncheckedCreateWithoutDocumentInput> | Prisma.DocumentOperationCreateWithoutDocumentInput[] | Prisma.DocumentOperationUncheckedCreateWithoutDocumentInput[];
    connectOrCreate?: Prisma.DocumentOperationCreateOrConnectWithoutDocumentInput | Prisma.DocumentOperationCreateOrConnectWithoutDocumentInput[];
    createMany?: Prisma.DocumentOperationCreateManyDocumentInputEnvelope;
    connect?: Prisma.DocumentOperationWhereUniqueInput | Prisma.DocumentOperationWhereUniqueInput[];
};
export type DocumentOperationUpdateManyWithoutDocumentNestedInput = {
    create?: Prisma.XOR<Prisma.DocumentOperationCreateWithoutDocumentInput, Prisma.DocumentOperationUncheckedCreateWithoutDocumentInput> | Prisma.DocumentOperationCreateWithoutDocumentInput[] | Prisma.DocumentOperationUncheckedCreateWithoutDocumentInput[];
    connectOrCreate?: Prisma.DocumentOperationCreateOrConnectWithoutDocumentInput | Prisma.DocumentOperationCreateOrConnectWithoutDocumentInput[];
    upsert?: Prisma.DocumentOperationUpsertWithWhereUniqueWithoutDocumentInput | Prisma.DocumentOperationUpsertWithWhereUniqueWithoutDocumentInput[];
    createMany?: Prisma.DocumentOperationCreateManyDocumentInputEnvelope;
    set?: Prisma.DocumentOperationWhereUniqueInput | Prisma.DocumentOperationWhereUniqueInput[];
    disconnect?: Prisma.DocumentOperationWhereUniqueInput | Prisma.DocumentOperationWhereUniqueInput[];
    delete?: Prisma.DocumentOperationWhereUniqueInput | Prisma.DocumentOperationWhereUniqueInput[];
    connect?: Prisma.DocumentOperationWhereUniqueInput | Prisma.DocumentOperationWhereUniqueInput[];
    update?: Prisma.DocumentOperationUpdateWithWhereUniqueWithoutDocumentInput | Prisma.DocumentOperationUpdateWithWhereUniqueWithoutDocumentInput[];
    updateMany?: Prisma.DocumentOperationUpdateManyWithWhereWithoutDocumentInput | Prisma.DocumentOperationUpdateManyWithWhereWithoutDocumentInput[];
    deleteMany?: Prisma.DocumentOperationScalarWhereInput | Prisma.DocumentOperationScalarWhereInput[];
};
export type DocumentOperationUncheckedUpdateManyWithoutDocumentNestedInput = {
    create?: Prisma.XOR<Prisma.DocumentOperationCreateWithoutDocumentInput, Prisma.DocumentOperationUncheckedCreateWithoutDocumentInput> | Prisma.DocumentOperationCreateWithoutDocumentInput[] | Prisma.DocumentOperationUncheckedCreateWithoutDocumentInput[];
    connectOrCreate?: Prisma.DocumentOperationCreateOrConnectWithoutDocumentInput | Prisma.DocumentOperationCreateOrConnectWithoutDocumentInput[];
    upsert?: Prisma.DocumentOperationUpsertWithWhereUniqueWithoutDocumentInput | Prisma.DocumentOperationUpsertWithWhereUniqueWithoutDocumentInput[];
    createMany?: Prisma.DocumentOperationCreateManyDocumentInputEnvelope;
    set?: Prisma.DocumentOperationWhereUniqueInput | Prisma.DocumentOperationWhereUniqueInput[];
    disconnect?: Prisma.DocumentOperationWhereUniqueInput | Prisma.DocumentOperationWhereUniqueInput[];
    delete?: Prisma.DocumentOperationWhereUniqueInput | Prisma.DocumentOperationWhereUniqueInput[];
    connect?: Prisma.DocumentOperationWhereUniqueInput | Prisma.DocumentOperationWhereUniqueInput[];
    update?: Prisma.DocumentOperationUpdateWithWhereUniqueWithoutDocumentInput | Prisma.DocumentOperationUpdateWithWhereUniqueWithoutDocumentInput[];
    updateMany?: Prisma.DocumentOperationUpdateManyWithWhereWithoutDocumentInput | Prisma.DocumentOperationUpdateManyWithWhereWithoutDocumentInput[];
    deleteMany?: Prisma.DocumentOperationScalarWhereInput | Prisma.DocumentOperationScalarWhereInput[];
};
export type BigIntFieldUpdateOperationsInput = {
    set?: bigint | number;
    increment?: bigint | number;
    decrement?: bigint | number;
    multiply?: bigint | number;
    divide?: bigint | number;
};
export type DocumentOperationCreateWithoutUserInput = {
    id?: string;
    operationId: string;
    operationType: string;
    payload: runtime.Bytes;
    vectorClock?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    lamportTs?: bigint | number;
    clientId?: string | null;
    createdAt?: Date | string;
    document: Prisma.DocumentCreateNestedOneWithoutOperationsInput;
};
export type DocumentOperationUncheckedCreateWithoutUserInput = {
    id?: string;
    documentId: string;
    operationId: string;
    operationType: string;
    payload: runtime.Bytes;
    vectorClock?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    lamportTs?: bigint | number;
    clientId?: string | null;
    createdAt?: Date | string;
};
export type DocumentOperationCreateOrConnectWithoutUserInput = {
    where: Prisma.DocumentOperationWhereUniqueInput;
    create: Prisma.XOR<Prisma.DocumentOperationCreateWithoutUserInput, Prisma.DocumentOperationUncheckedCreateWithoutUserInput>;
};
export type DocumentOperationCreateManyUserInputEnvelope = {
    data: Prisma.DocumentOperationCreateManyUserInput | Prisma.DocumentOperationCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type DocumentOperationUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.DocumentOperationWhereUniqueInput;
    update: Prisma.XOR<Prisma.DocumentOperationUpdateWithoutUserInput, Prisma.DocumentOperationUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.DocumentOperationCreateWithoutUserInput, Prisma.DocumentOperationUncheckedCreateWithoutUserInput>;
};
export type DocumentOperationUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.DocumentOperationWhereUniqueInput;
    data: Prisma.XOR<Prisma.DocumentOperationUpdateWithoutUserInput, Prisma.DocumentOperationUncheckedUpdateWithoutUserInput>;
};
export type DocumentOperationUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.DocumentOperationScalarWhereInput;
    data: Prisma.XOR<Prisma.DocumentOperationUpdateManyMutationInput, Prisma.DocumentOperationUncheckedUpdateManyWithoutUserInput>;
};
export type DocumentOperationScalarWhereInput = {
    AND?: Prisma.DocumentOperationScalarWhereInput | Prisma.DocumentOperationScalarWhereInput[];
    OR?: Prisma.DocumentOperationScalarWhereInput[];
    NOT?: Prisma.DocumentOperationScalarWhereInput | Prisma.DocumentOperationScalarWhereInput[];
    id?: Prisma.StringFilter<"DocumentOperation"> | string;
    documentId?: Prisma.StringFilter<"DocumentOperation"> | string;
    userId?: Prisma.StringFilter<"DocumentOperation"> | string;
    operationId?: Prisma.StringFilter<"DocumentOperation"> | string;
    operationType?: Prisma.StringFilter<"DocumentOperation"> | string;
    payload?: Prisma.BytesFilter<"DocumentOperation"> | runtime.Bytes;
    vectorClock?: Prisma.JsonNullableFilter<"DocumentOperation">;
    lamportTs?: Prisma.BigIntFilter<"DocumentOperation"> | bigint | number;
    clientId?: Prisma.StringNullableFilter<"DocumentOperation"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"DocumentOperation"> | Date | string;
};
export type DocumentOperationCreateWithoutDocumentInput = {
    id?: string;
    operationId: string;
    operationType: string;
    payload: runtime.Bytes;
    vectorClock?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    lamportTs?: bigint | number;
    clientId?: string | null;
    createdAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutOperationsInput;
};
export type DocumentOperationUncheckedCreateWithoutDocumentInput = {
    id?: string;
    userId: string;
    operationId: string;
    operationType: string;
    payload: runtime.Bytes;
    vectorClock?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    lamportTs?: bigint | number;
    clientId?: string | null;
    createdAt?: Date | string;
};
export type DocumentOperationCreateOrConnectWithoutDocumentInput = {
    where: Prisma.DocumentOperationWhereUniqueInput;
    create: Prisma.XOR<Prisma.DocumentOperationCreateWithoutDocumentInput, Prisma.DocumentOperationUncheckedCreateWithoutDocumentInput>;
};
export type DocumentOperationCreateManyDocumentInputEnvelope = {
    data: Prisma.DocumentOperationCreateManyDocumentInput | Prisma.DocumentOperationCreateManyDocumentInput[];
    skipDuplicates?: boolean;
};
export type DocumentOperationUpsertWithWhereUniqueWithoutDocumentInput = {
    where: Prisma.DocumentOperationWhereUniqueInput;
    update: Prisma.XOR<Prisma.DocumentOperationUpdateWithoutDocumentInput, Prisma.DocumentOperationUncheckedUpdateWithoutDocumentInput>;
    create: Prisma.XOR<Prisma.DocumentOperationCreateWithoutDocumentInput, Prisma.DocumentOperationUncheckedCreateWithoutDocumentInput>;
};
export type DocumentOperationUpdateWithWhereUniqueWithoutDocumentInput = {
    where: Prisma.DocumentOperationWhereUniqueInput;
    data: Prisma.XOR<Prisma.DocumentOperationUpdateWithoutDocumentInput, Prisma.DocumentOperationUncheckedUpdateWithoutDocumentInput>;
};
export type DocumentOperationUpdateManyWithWhereWithoutDocumentInput = {
    where: Prisma.DocumentOperationScalarWhereInput;
    data: Prisma.XOR<Prisma.DocumentOperationUpdateManyMutationInput, Prisma.DocumentOperationUncheckedUpdateManyWithoutDocumentInput>;
};
export type DocumentOperationCreateManyUserInput = {
    id?: string;
    documentId: string;
    operationId: string;
    operationType: string;
    payload: runtime.Bytes;
    vectorClock?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    lamportTs?: bigint | number;
    clientId?: string | null;
    createdAt?: Date | string;
};
export type DocumentOperationUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    operationId?: Prisma.StringFieldUpdateOperationsInput | string;
    operationType?: Prisma.StringFieldUpdateOperationsInput | string;
    payload?: Prisma.BytesFieldUpdateOperationsInput | runtime.Bytes;
    vectorClock?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    lamportTs?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clientId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    document?: Prisma.DocumentUpdateOneRequiredWithoutOperationsNestedInput;
};
export type DocumentOperationUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    documentId?: Prisma.StringFieldUpdateOperationsInput | string;
    operationId?: Prisma.StringFieldUpdateOperationsInput | string;
    operationType?: Prisma.StringFieldUpdateOperationsInput | string;
    payload?: Prisma.BytesFieldUpdateOperationsInput | runtime.Bytes;
    vectorClock?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    lamportTs?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clientId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DocumentOperationUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    documentId?: Prisma.StringFieldUpdateOperationsInput | string;
    operationId?: Prisma.StringFieldUpdateOperationsInput | string;
    operationType?: Prisma.StringFieldUpdateOperationsInput | string;
    payload?: Prisma.BytesFieldUpdateOperationsInput | runtime.Bytes;
    vectorClock?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    lamportTs?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clientId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DocumentOperationCreateManyDocumentInput = {
    id?: string;
    userId: string;
    operationId: string;
    operationType: string;
    payload: runtime.Bytes;
    vectorClock?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    lamportTs?: bigint | number;
    clientId?: string | null;
    createdAt?: Date | string;
};
export type DocumentOperationUpdateWithoutDocumentInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    operationId?: Prisma.StringFieldUpdateOperationsInput | string;
    operationType?: Prisma.StringFieldUpdateOperationsInput | string;
    payload?: Prisma.BytesFieldUpdateOperationsInput | runtime.Bytes;
    vectorClock?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    lamportTs?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clientId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutOperationsNestedInput;
};
export type DocumentOperationUncheckedUpdateWithoutDocumentInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    operationId?: Prisma.StringFieldUpdateOperationsInput | string;
    operationType?: Prisma.StringFieldUpdateOperationsInput | string;
    payload?: Prisma.BytesFieldUpdateOperationsInput | runtime.Bytes;
    vectorClock?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    lamportTs?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clientId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DocumentOperationUncheckedUpdateManyWithoutDocumentInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    operationId?: Prisma.StringFieldUpdateOperationsInput | string;
    operationType?: Prisma.StringFieldUpdateOperationsInput | string;
    payload?: Prisma.BytesFieldUpdateOperationsInput | runtime.Bytes;
    vectorClock?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    lamportTs?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    clientId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DocumentOperationSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    documentId?: boolean;
    userId?: boolean;
    operationId?: boolean;
    operationType?: boolean;
    payload?: boolean;
    vectorClock?: boolean;
    lamportTs?: boolean;
    clientId?: boolean;
    createdAt?: boolean;
    document?: boolean | Prisma.DocumentDefaultArgs<ExtArgs>;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["documentOperation"]>;
export type DocumentOperationSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    documentId?: boolean;
    userId?: boolean;
    operationId?: boolean;
    operationType?: boolean;
    payload?: boolean;
    vectorClock?: boolean;
    lamportTs?: boolean;
    clientId?: boolean;
    createdAt?: boolean;
    document?: boolean | Prisma.DocumentDefaultArgs<ExtArgs>;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["documentOperation"]>;
export type DocumentOperationSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    documentId?: boolean;
    userId?: boolean;
    operationId?: boolean;
    operationType?: boolean;
    payload?: boolean;
    vectorClock?: boolean;
    lamportTs?: boolean;
    clientId?: boolean;
    createdAt?: boolean;
    document?: boolean | Prisma.DocumentDefaultArgs<ExtArgs>;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["documentOperation"]>;
export type DocumentOperationSelectScalar = {
    id?: boolean;
    documentId?: boolean;
    userId?: boolean;
    operationId?: boolean;
    operationType?: boolean;
    payload?: boolean;
    vectorClock?: boolean;
    lamportTs?: boolean;
    clientId?: boolean;
    createdAt?: boolean;
};
export type DocumentOperationOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "documentId" | "userId" | "operationId" | "operationType" | "payload" | "vectorClock" | "lamportTs" | "clientId" | "createdAt", ExtArgs["result"]["documentOperation"]>;
export type DocumentOperationInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    document?: boolean | Prisma.DocumentDefaultArgs<ExtArgs>;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type DocumentOperationIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    document?: boolean | Prisma.DocumentDefaultArgs<ExtArgs>;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type DocumentOperationIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    document?: boolean | Prisma.DocumentDefaultArgs<ExtArgs>;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $DocumentOperationPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "DocumentOperation";
    objects: {
        document: Prisma.$DocumentPayload<ExtArgs>;
        user: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        documentId: string;
        userId: string;
        operationId: string;
        operationType: string;
        payload: runtime.Bytes;
        vectorClock: runtime.JsonValue | null;
        lamportTs: bigint;
        clientId: string | null;
        createdAt: Date;
    }, ExtArgs["result"]["documentOperation"]>;
    composites: {};
};
export type DocumentOperationGetPayload<S extends boolean | null | undefined | DocumentOperationDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$DocumentOperationPayload, S>;
export type DocumentOperationCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<DocumentOperationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: DocumentOperationCountAggregateInputType | true;
};
export interface DocumentOperationDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['DocumentOperation'];
        meta: {
            name: 'DocumentOperation';
        };
    };
    /**
     * Find zero or one DocumentOperation that matches the filter.
     * @param {DocumentOperationFindUniqueArgs} args - Arguments to find a DocumentOperation
     * @example
     * // Get one DocumentOperation
     * const documentOperation = await prisma.documentOperation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DocumentOperationFindUniqueArgs>(args: Prisma.SelectSubset<T, DocumentOperationFindUniqueArgs<ExtArgs>>): Prisma.Prisma__DocumentOperationClient<runtime.Types.Result.GetResult<Prisma.$DocumentOperationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one DocumentOperation that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DocumentOperationFindUniqueOrThrowArgs} args - Arguments to find a DocumentOperation
     * @example
     * // Get one DocumentOperation
     * const documentOperation = await prisma.documentOperation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DocumentOperationFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, DocumentOperationFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__DocumentOperationClient<runtime.Types.Result.GetResult<Prisma.$DocumentOperationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first DocumentOperation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentOperationFindFirstArgs} args - Arguments to find a DocumentOperation
     * @example
     * // Get one DocumentOperation
     * const documentOperation = await prisma.documentOperation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DocumentOperationFindFirstArgs>(args?: Prisma.SelectSubset<T, DocumentOperationFindFirstArgs<ExtArgs>>): Prisma.Prisma__DocumentOperationClient<runtime.Types.Result.GetResult<Prisma.$DocumentOperationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first DocumentOperation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentOperationFindFirstOrThrowArgs} args - Arguments to find a DocumentOperation
     * @example
     * // Get one DocumentOperation
     * const documentOperation = await prisma.documentOperation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DocumentOperationFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, DocumentOperationFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__DocumentOperationClient<runtime.Types.Result.GetResult<Prisma.$DocumentOperationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more DocumentOperations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentOperationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DocumentOperations
     * const documentOperations = await prisma.documentOperation.findMany()
     *
     * // Get first 10 DocumentOperations
     * const documentOperations = await prisma.documentOperation.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const documentOperationWithIdOnly = await prisma.documentOperation.findMany({ select: { id: true } })
     *
     */
    findMany<T extends DocumentOperationFindManyArgs>(args?: Prisma.SelectSubset<T, DocumentOperationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DocumentOperationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a DocumentOperation.
     * @param {DocumentOperationCreateArgs} args - Arguments to create a DocumentOperation.
     * @example
     * // Create one DocumentOperation
     * const DocumentOperation = await prisma.documentOperation.create({
     *   data: {
     *     // ... data to create a DocumentOperation
     *   }
     * })
     *
     */
    create<T extends DocumentOperationCreateArgs>(args: Prisma.SelectSubset<T, DocumentOperationCreateArgs<ExtArgs>>): Prisma.Prisma__DocumentOperationClient<runtime.Types.Result.GetResult<Prisma.$DocumentOperationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many DocumentOperations.
     * @param {DocumentOperationCreateManyArgs} args - Arguments to create many DocumentOperations.
     * @example
     * // Create many DocumentOperations
     * const documentOperation = await prisma.documentOperation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends DocumentOperationCreateManyArgs>(args?: Prisma.SelectSubset<T, DocumentOperationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many DocumentOperations and returns the data saved in the database.
     * @param {DocumentOperationCreateManyAndReturnArgs} args - Arguments to create many DocumentOperations.
     * @example
     * // Create many DocumentOperations
     * const documentOperation = await prisma.documentOperation.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many DocumentOperations and only return the `id`
     * const documentOperationWithIdOnly = await prisma.documentOperation.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends DocumentOperationCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, DocumentOperationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DocumentOperationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a DocumentOperation.
     * @param {DocumentOperationDeleteArgs} args - Arguments to delete one DocumentOperation.
     * @example
     * // Delete one DocumentOperation
     * const DocumentOperation = await prisma.documentOperation.delete({
     *   where: {
     *     // ... filter to delete one DocumentOperation
     *   }
     * })
     *
     */
    delete<T extends DocumentOperationDeleteArgs>(args: Prisma.SelectSubset<T, DocumentOperationDeleteArgs<ExtArgs>>): Prisma.Prisma__DocumentOperationClient<runtime.Types.Result.GetResult<Prisma.$DocumentOperationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one DocumentOperation.
     * @param {DocumentOperationUpdateArgs} args - Arguments to update one DocumentOperation.
     * @example
     * // Update one DocumentOperation
     * const documentOperation = await prisma.documentOperation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends DocumentOperationUpdateArgs>(args: Prisma.SelectSubset<T, DocumentOperationUpdateArgs<ExtArgs>>): Prisma.Prisma__DocumentOperationClient<runtime.Types.Result.GetResult<Prisma.$DocumentOperationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more DocumentOperations.
     * @param {DocumentOperationDeleteManyArgs} args - Arguments to filter DocumentOperations to delete.
     * @example
     * // Delete a few DocumentOperations
     * const { count } = await prisma.documentOperation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends DocumentOperationDeleteManyArgs>(args?: Prisma.SelectSubset<T, DocumentOperationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more DocumentOperations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentOperationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DocumentOperations
     * const documentOperation = await prisma.documentOperation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends DocumentOperationUpdateManyArgs>(args: Prisma.SelectSubset<T, DocumentOperationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more DocumentOperations and returns the data updated in the database.
     * @param {DocumentOperationUpdateManyAndReturnArgs} args - Arguments to update many DocumentOperations.
     * @example
     * // Update many DocumentOperations
     * const documentOperation = await prisma.documentOperation.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more DocumentOperations and only return the `id`
     * const documentOperationWithIdOnly = await prisma.documentOperation.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends DocumentOperationUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, DocumentOperationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DocumentOperationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one DocumentOperation.
     * @param {DocumentOperationUpsertArgs} args - Arguments to update or create a DocumentOperation.
     * @example
     * // Update or create a DocumentOperation
     * const documentOperation = await prisma.documentOperation.upsert({
     *   create: {
     *     // ... data to create a DocumentOperation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DocumentOperation we want to update
     *   }
     * })
     */
    upsert<T extends DocumentOperationUpsertArgs>(args: Prisma.SelectSubset<T, DocumentOperationUpsertArgs<ExtArgs>>): Prisma.Prisma__DocumentOperationClient<runtime.Types.Result.GetResult<Prisma.$DocumentOperationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of DocumentOperations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentOperationCountArgs} args - Arguments to filter DocumentOperations to count.
     * @example
     * // Count the number of DocumentOperations
     * const count = await prisma.documentOperation.count({
     *   where: {
     *     // ... the filter for the DocumentOperations we want to count
     *   }
     * })
    **/
    count<T extends DocumentOperationCountArgs>(args?: Prisma.Subset<T, DocumentOperationCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], DocumentOperationCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a DocumentOperation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentOperationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DocumentOperationAggregateArgs>(args: Prisma.Subset<T, DocumentOperationAggregateArgs>): Prisma.PrismaPromise<GetDocumentOperationAggregateType<T>>;
    /**
     * Group by DocumentOperation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentOperationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<T extends DocumentOperationGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: DocumentOperationGroupByArgs['orderBy'];
    } : {
        orderBy?: DocumentOperationGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, DocumentOperationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDocumentOperationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the DocumentOperation model
     */
    readonly fields: DocumentOperationFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for DocumentOperation.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__DocumentOperationClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    document<T extends Prisma.DocumentDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.DocumentDefaultArgs<ExtArgs>>): Prisma.Prisma__DocumentClient<runtime.Types.Result.GetResult<Prisma.$DocumentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
/**
 * Fields of the DocumentOperation model
 */
export interface DocumentOperationFieldRefs {
    readonly id: Prisma.FieldRef<"DocumentOperation", 'String'>;
    readonly documentId: Prisma.FieldRef<"DocumentOperation", 'String'>;
    readonly userId: Prisma.FieldRef<"DocumentOperation", 'String'>;
    readonly operationId: Prisma.FieldRef<"DocumentOperation", 'String'>;
    readonly operationType: Prisma.FieldRef<"DocumentOperation", 'String'>;
    readonly payload: Prisma.FieldRef<"DocumentOperation", 'Bytes'>;
    readonly vectorClock: Prisma.FieldRef<"DocumentOperation", 'Json'>;
    readonly lamportTs: Prisma.FieldRef<"DocumentOperation", 'BigInt'>;
    readonly clientId: Prisma.FieldRef<"DocumentOperation", 'String'>;
    readonly createdAt: Prisma.FieldRef<"DocumentOperation", 'DateTime'>;
}
/**
 * DocumentOperation findUnique
 */
export type DocumentOperationFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentOperation
     */
    select?: Prisma.DocumentOperationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DocumentOperation
     */
    omit?: Prisma.DocumentOperationOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DocumentOperationInclude<ExtArgs> | null;
    /**
     * Filter, which DocumentOperation to fetch.
     */
    where: Prisma.DocumentOperationWhereUniqueInput;
};
/**
 * DocumentOperation findUniqueOrThrow
 */
export type DocumentOperationFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentOperation
     */
    select?: Prisma.DocumentOperationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DocumentOperation
     */
    omit?: Prisma.DocumentOperationOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DocumentOperationInclude<ExtArgs> | null;
    /**
     * Filter, which DocumentOperation to fetch.
     */
    where: Prisma.DocumentOperationWhereUniqueInput;
};
/**
 * DocumentOperation findFirst
 */
export type DocumentOperationFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentOperation
     */
    select?: Prisma.DocumentOperationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DocumentOperation
     */
    omit?: Prisma.DocumentOperationOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DocumentOperationInclude<ExtArgs> | null;
    /**
     * Filter, which DocumentOperation to fetch.
     */
    where?: Prisma.DocumentOperationWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DocumentOperations to fetch.
     */
    orderBy?: Prisma.DocumentOperationOrderByWithRelationInput | Prisma.DocumentOperationOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for DocumentOperations.
     */
    cursor?: Prisma.DocumentOperationWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DocumentOperations from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DocumentOperations.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of DocumentOperations.
     */
    distinct?: Prisma.DocumentOperationScalarFieldEnum | Prisma.DocumentOperationScalarFieldEnum[];
};
/**
 * DocumentOperation findFirstOrThrow
 */
export type DocumentOperationFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentOperation
     */
    select?: Prisma.DocumentOperationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DocumentOperation
     */
    omit?: Prisma.DocumentOperationOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DocumentOperationInclude<ExtArgs> | null;
    /**
     * Filter, which DocumentOperation to fetch.
     */
    where?: Prisma.DocumentOperationWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DocumentOperations to fetch.
     */
    orderBy?: Prisma.DocumentOperationOrderByWithRelationInput | Prisma.DocumentOperationOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for DocumentOperations.
     */
    cursor?: Prisma.DocumentOperationWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DocumentOperations from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DocumentOperations.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of DocumentOperations.
     */
    distinct?: Prisma.DocumentOperationScalarFieldEnum | Prisma.DocumentOperationScalarFieldEnum[];
};
/**
 * DocumentOperation findMany
 */
export type DocumentOperationFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentOperation
     */
    select?: Prisma.DocumentOperationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DocumentOperation
     */
    omit?: Prisma.DocumentOperationOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DocumentOperationInclude<ExtArgs> | null;
    /**
     * Filter, which DocumentOperations to fetch.
     */
    where?: Prisma.DocumentOperationWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DocumentOperations to fetch.
     */
    orderBy?: Prisma.DocumentOperationOrderByWithRelationInput | Prisma.DocumentOperationOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing DocumentOperations.
     */
    cursor?: Prisma.DocumentOperationWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DocumentOperations from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DocumentOperations.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of DocumentOperations.
     */
    distinct?: Prisma.DocumentOperationScalarFieldEnum | Prisma.DocumentOperationScalarFieldEnum[];
};
/**
 * DocumentOperation create
 */
export type DocumentOperationCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentOperation
     */
    select?: Prisma.DocumentOperationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DocumentOperation
     */
    omit?: Prisma.DocumentOperationOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DocumentOperationInclude<ExtArgs> | null;
    /**
     * The data needed to create a DocumentOperation.
     */
    data: Prisma.XOR<Prisma.DocumentOperationCreateInput, Prisma.DocumentOperationUncheckedCreateInput>;
};
/**
 * DocumentOperation createMany
 */
export type DocumentOperationCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many DocumentOperations.
     */
    data: Prisma.DocumentOperationCreateManyInput | Prisma.DocumentOperationCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * DocumentOperation createManyAndReturn
 */
export type DocumentOperationCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentOperation
     */
    select?: Prisma.DocumentOperationSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the DocumentOperation
     */
    omit?: Prisma.DocumentOperationOmit<ExtArgs> | null;
    /**
     * The data used to create many DocumentOperations.
     */
    data: Prisma.DocumentOperationCreateManyInput | Prisma.DocumentOperationCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DocumentOperationIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * DocumentOperation update
 */
export type DocumentOperationUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentOperation
     */
    select?: Prisma.DocumentOperationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DocumentOperation
     */
    omit?: Prisma.DocumentOperationOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DocumentOperationInclude<ExtArgs> | null;
    /**
     * The data needed to update a DocumentOperation.
     */
    data: Prisma.XOR<Prisma.DocumentOperationUpdateInput, Prisma.DocumentOperationUncheckedUpdateInput>;
    /**
     * Choose, which DocumentOperation to update.
     */
    where: Prisma.DocumentOperationWhereUniqueInput;
};
/**
 * DocumentOperation updateMany
 */
export type DocumentOperationUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update DocumentOperations.
     */
    data: Prisma.XOR<Prisma.DocumentOperationUpdateManyMutationInput, Prisma.DocumentOperationUncheckedUpdateManyInput>;
    /**
     * Filter which DocumentOperations to update
     */
    where?: Prisma.DocumentOperationWhereInput;
    /**
     * Limit how many DocumentOperations to update.
     */
    limit?: number;
};
/**
 * DocumentOperation updateManyAndReturn
 */
export type DocumentOperationUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentOperation
     */
    select?: Prisma.DocumentOperationSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the DocumentOperation
     */
    omit?: Prisma.DocumentOperationOmit<ExtArgs> | null;
    /**
     * The data used to update DocumentOperations.
     */
    data: Prisma.XOR<Prisma.DocumentOperationUpdateManyMutationInput, Prisma.DocumentOperationUncheckedUpdateManyInput>;
    /**
     * Filter which DocumentOperations to update
     */
    where?: Prisma.DocumentOperationWhereInput;
    /**
     * Limit how many DocumentOperations to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DocumentOperationIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * DocumentOperation upsert
 */
export type DocumentOperationUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentOperation
     */
    select?: Prisma.DocumentOperationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DocumentOperation
     */
    omit?: Prisma.DocumentOperationOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DocumentOperationInclude<ExtArgs> | null;
    /**
     * The filter to search for the DocumentOperation to update in case it exists.
     */
    where: Prisma.DocumentOperationWhereUniqueInput;
    /**
     * In case the DocumentOperation found by the `where` argument doesn't exist, create a new DocumentOperation with this data.
     */
    create: Prisma.XOR<Prisma.DocumentOperationCreateInput, Prisma.DocumentOperationUncheckedCreateInput>;
    /**
     * In case the DocumentOperation was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.DocumentOperationUpdateInput, Prisma.DocumentOperationUncheckedUpdateInput>;
};
/**
 * DocumentOperation delete
 */
export type DocumentOperationDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentOperation
     */
    select?: Prisma.DocumentOperationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DocumentOperation
     */
    omit?: Prisma.DocumentOperationOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DocumentOperationInclude<ExtArgs> | null;
    /**
     * Filter which DocumentOperation to delete.
     */
    where: Prisma.DocumentOperationWhereUniqueInput;
};
/**
 * DocumentOperation deleteMany
 */
export type DocumentOperationDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which DocumentOperations to delete
     */
    where?: Prisma.DocumentOperationWhereInput;
    /**
     * Limit how many DocumentOperations to delete.
     */
    limit?: number;
};
/**
 * DocumentOperation without action
 */
export type DocumentOperationDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentOperation
     */
    select?: Prisma.DocumentOperationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DocumentOperation
     */
    omit?: Prisma.DocumentOperationOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DocumentOperationInclude<ExtArgs> | null;
};
//# sourceMappingURL=DocumentOperation.d.ts.map