import { useQuery } from '@tanstack/react-query'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCitiesQuery } from '@/features/hotels'
import { searchHotels } from '../api/search-api'
import { listingStaySchema, parseListingSearch, updateListingStay, type ListingStay } from '../model/client-listing-search'

export function useClientListings() {
  const [params, setParams] = useSearchParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const cities = useCitiesQuery()
  const parsed = parseListingSearch(params)
  const chosenCity = cities.data?.find(c => c.id === params.get('cityId') || c.slug === params.get('citySlug'))
  const form = useForm<ListingStay>({ resolver: zodResolver(listingStaySchema), values: {
    cityId: chosenCity?.id ?? params.get('cityId') ?? '', checkIn: params.get('checkIn') ?? '', checkOut: params.get('checkOut') ?? '',
    adults: parsed?.stay.adults ?? 2, children: parsed?.stay.children ?? 0,
  } })
  const query = useQuery({ queryKey: ['discovery', 'search', parsed?.search], queryFn: ({ signal }) => searchHotels(parsed!.search, signal), enabled: Boolean(parsed), retry: false })
  function submit(value: ListingStay) {
    const search = updateListingStay(params, value).toString()
    void navigate({ pathname: '/explore', search, hash: '#stays' }, {
      viewTransition: pathname !== '/explore',
    })
  }
  function selectCity(id: string) {
    const next = new URLSearchParams(params)
    next.delete('citySlug'); next.delete('cityId'); next.delete('page')
    if (id) next.set('cityId', id)
    setParams(next, { preventScrollReset: true })
    form.setValue('cityId', id)
  }
  return { params, setParams, parsed, cities, chosenCity, form, query, submit, selectCity }
}
